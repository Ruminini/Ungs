async function loadData() {
	const calendario = await fetch("data/calendario.json").then((r) => r.json());
	const comisiones = await fetch("data/comisiones.json").then((r) => r.json());
	const faq = await fetch("data/faq.json").then((r) => r.json());

	renderCalendario(calendario);
	renderComisiones(comisiones);
	renderFAQ(faq);
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
						`<div class="card ${e.activo ? "active" : ""} ${
							e.date < hoy && !e.activo ? "old" : ""
						}">${e.fecha.slice(0, -5)}${
							e.fechaFin ? " - " + e.fechaFin.slice(0, -5) : ""
						} — <b>${e.descripcion}</b></div>`
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

function renderComisiones(data) {
	const div = document.getElementById("comisiones-content");
	div.innerHTML = "";

	// Agrupar comisiones por Actividad
	const materias = {};
	Object.entries(data).forEach(([num, c]) => {
		const act = c.Actividad;
		if (!materias[act]) materias[act] = [];
		materias[act].push({ num, ...c });
	});

	// Renderizar cada materia (actividad)
	Object.entries(materias).forEach(([actividad, comisiones]) => {
		const card = document.createElement("div");
		card.className = "card";

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

			// Subinfo + tabla
			html += `
        <div class="subcard">
          <p class="subinfo">
            <b>${c.num}</b> — ${docentes}<br>
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

window.onload = loadData;
