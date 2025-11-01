async function loadData() {
	const calendario = await fetch("data/calendario.json").then((r) => r.json());
	const materias = await fetch("data/materias.json").then((r) => r.json());
	const faq = await fetch("data/faq.json").then((r) => r.json());

	renderCalendario(calendario);
	renderMaterias(materias);
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

function renderMaterias(data) {
	const div = document.getElementById("materias-content");
	div.innerHTML = "";
	data.materias.forEach((m) => {
		const card = document.createElement("div");
		card.className = "card";
		card.innerHTML = `<h3>${m.nombre}</h3>
      <p><b>Comision:</b> ${m.comision}</p>
      <p><b>Turno:</b> ${m.turno}</p>
      <p><b>Horario:</b> ${m.horario}</p>`;
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
