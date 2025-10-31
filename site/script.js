async function loadData() {
	const calendario = await fetch("data/calendario.json").then((r) => r.json());
	const materias = await fetch("data/materias.json").then((r) => r.json());
	const faq = await fetch("data/faq.json").then((r) => r.json());

	renderCalendario(calendario);
	renderMaterias(materias);
	renderFAQ(faq);
}

function renderCalendario(data) {
	const div = document.getElementById("calendario-content");
	div.innerHTML = "";
	data.eventos.forEach((e) => {
		const card = document.createElement("div");
		card.className = "card";
		card.innerHTML = `<b>${e.fecha}</b> — ${e.descripcion}`;
		div.appendChild(card);
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
