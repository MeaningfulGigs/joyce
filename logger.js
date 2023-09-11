export function log(message) {
  var logger = document.getElementById("agent_log");
  logger.innerHTML += `<p>${message}</p>`;
}

export function logSummary(summary) {
  var logger = document.getElementById("summary");
  logger.innerHTML = `<h5>${summary}</h5>`;
}
