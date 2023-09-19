export function log(id, message) {
  const logger = document.getElementById(id);

  const keywords = ["specialties", "skills", "tools", "industries"];

  if (id === "summary") {
    logger.innerHTML = `<h5>${message}</h5>`;
  } else if (id === "agents") {
    logger.innerHTML += `<p>${message}</p>`;
  } else if (id === "actions") {
    logger.innerHTML += `<div>${message.name}<span>${message.explain}</span></div><br />`;
  } else if (keywords.includes(id)) {
    message.map(
      (kw) =>
        (logger.innerHTML = `<div>${kw.name}<span>${kw.explain}</span></div><br />`)
    );
  } else {
    return;
  }
}
