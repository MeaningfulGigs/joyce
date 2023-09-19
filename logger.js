export function log(id, message) {
  const logger = document.getElementById(id);

  const keywords = ["specialties", "skills", "tools", "industries"];

  if (id === "summary") {
    logger.innerHTML = `<h5>${message}</h5>`;
  } else if (keywords.includes(id)) {
    message.map(
      (kw) =>
        (logger.innerHTML += `<div>${kw.name}<span>${kw.explain}</span></div><br />`)
    );
  } else if (id === "agents") {
    logger.innerHTML += `<p>${message}</p>`;
  } else {
    return;
  }
}
