let allMaterias = null;

async function loadData() {
	const calendario = await fetch("data/calendario.json").then((r) => r.json());
	const comisiones = await fetch("data/comisiones.json").then((r) => r.json());
	const faq = await fetch("data/faq.json").then((r) => r.json());

	renderCalendario(calendario);
	allMaterias = comisionesToMaterias(comisiones);
	renderComisiones(allMaterias);
	renderFAQ(faq);

	const searchInput = document.getElementById("search-input");
	searchInput.addEventListener(
		"input",
		debounce((e) => {
			filterComisiones(e.target.value);
		}, 300)
	);
}

function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

function strToId(str) {
	return str.replace(/\s+/g, "-").toLowerCase();
}

function renderCalendario(data) {
	const hoy = new Date();
	const proximosEventos = document.getElementById("proximos-eventos");
	let calendarioData = data.eventos;
	calendarioData = calendarioData
		.map((e) => {
			const [d, m, y] = e.fecha.split("/").map(Number);
			const date = new Date(y, m - 1, d);
			const tieneFin = e["fechaFin"] ? true : false;
			if (tieneFin) {
				const [df, mf, yf] = e["fechaFin"].split("/").map(Number);
				const endDate = new Date(yf, mf - 1, df);
				return { ...e, date: date, endDate: endDate };
			}
			return { ...e, date: date };
		})
		.map((e) => {
			return {
				...e,
				activo: e.date == hoy || (e.endDate >= hoy && e.date <= hoy),
			};
		})
		.sort((a, b) => {
			if ((a.activo || a.date > hoy) && (b.activo || b.date > hoy))
				return a.date - b.date;
			if (a.activo || a.date > hoy) return 1;
			if (b.activo || b.date > hoy) return -1;
			return (
				(a.endDate ? a.endDate : a.date) - (b.endDate ? b.endDate : b.date)
			);
		});
	proximosEventos.innerHTML = calendarioData.length
		? calendarioData
				.map(
					(e) =>
						`<li class="card ${e.activo ? "active" : ""} ${
							e.date < hoy && !e.activo ? 'old" aria-disabled="true"' : ""
						}">${e.fecha.slice(0, -5)}${
							e.fechaFin ? " - " + e.fechaFin.slice(0, -5) : ""
						} — <b>${e.descripcion}</b></li>`
				)
				.join("")
		: "<p>No hay eventos activos.</p>";

	const events = proximosEventos.getElementsByClassName("card");
	let nextEvent = proximosEventos.querySelector(".card:not(.old)");
	nextEvent = nextEvent ? nextEvent : events[events.length - 1];
	proximosEventos.scrollBy({
		top: nextEvent.offsetTop - proximosEventos.offsetTop,
		behavior: "smooth",
	});
}

function comisionesToMaterias(data) {
	const materias = {};
	Object.entries(data).forEach(([num, c]) => {
		const act = c.Actividad;
		if (!materias[act]) materias[act] = [];
		const id = strToId(num);
		const com = num.replace(/^A\d{4}/, "").trim();
		materias[act].push({ com, id, ...c });
	});
	const ordered = Object.keys(materias)
		.sort()
		.reduce((obj, key) => {
			obj[key] = materias[key];
			return obj;
		}, {});
	Object.entries(ordered).forEach(([actividad, comisiones]) => {
		comisiones.forEach((c) => {
			const termino = [actividad, c.com, (c.Docentes || []).join(" ")]
				.join(" ")
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLocaleLowerCase();
			c.termino = termino;
		});
	});
	return ordered;
}

function renderComisiones(materias) {
	const div = document.getElementById("comisiones-content");

	Object.entries(materias).forEach(([actividad, comisiones]) => {
		const card = document.createElement("div");
		card.className = "card materia";
		card.id = strToId(actividad);
		card.style.display = "none";

		let html = `<h3>${actividad}</h3>`;

		comisiones.forEach((c) => {
			const docentes = c.Docentes.join(", ");

			let horariosTable = `
        <table class="mini-table">
          <tr><th>Día</th><th>Horario</th><th>Aula</th><th>Tipo</th></tr>
      `;
			for (let i = 0; i < c.Dia.length; i++) {
				horariosTable += `
          <tr>
            <td>${c.Dia[i]}</td>
            <td>${c.Horario[i]}</td>
            <td>${c.Aula[i]}</td>
            <td>${c.Tipo[i]}</td>
          </tr>
        `;
			}
			horariosTable += `</table>`;

			html += `
        <div class="subcard comision" id="${c.id}">
          <p class="subinfo">
            <b>${c.com}</b> — ${docentes}<br>
          </p>
          <div class="tabla-horarios">
            ${horariosTable}
          </div>
        </div>
      `;
		});

		card.innerHTML = html;
		div.appendChild(card);
	});
}

function renderFAQ(data) {
	const div = document.getElementById("faq-content");
	div.innerHTML = "";
	data.preguntas.forEach((q) => {
		const card = document.createElement("div");
		card.className = "card";
		card.innerHTML = `<b>${q.pregunta}</b><br>${q.respuesta}`;
		div.appendChild(card);
	});
}

function scrollToSection(id) {
	document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function filterComisiones(term) {
	if (!term.trim()) {
		document.getElementById("no-results").style.display = "none";
		document.querySelectorAll(".materia, .comision").forEach((el) => {
			el.style.display = "";
		});
		return;
	}

	const normalizedTerm = term
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();

	const tokens = normalizedTerm.split(/\s+/).filter((t) => t.length > 0);
	let anyVisible = false;
	Object.entries(allMaterias).forEach(([actividad, comisiones]) => {
		const actividadId = strToId(actividad);
		const materiaElement = document.getElementById(actividadId);
		let hasVisibleComisiones = false;

		comisiones.forEach((c) => {
			const comisionElement = document.getElementById(c.id);
			const matches = tokens.every((token) => c.termino.includes(token));

			if (matches) {
				comisionElement.style.display = "";
				hasVisibleComisiones = true;
				anyVisible = true;
			} else {
				comisionElement.style.display = "none";
			}
		});

		materiaElement.style.display = hasVisibleComisiones ? "" : "none";
	});
	const noResults = document.getElementById("no-results");
	noResults.textContent = "No se encontraron resultados";
	noResults.style.display = anyVisible ? "none" : "";
}

window.onload = loadData;
