import {
  orchestrate,
  summarize,
  parse,
  parseSpecialty,
  followup,
  refocus,
  search,
} from "./functions";

import { log, logSummary } from "../../logger";

import MessageHistory from "./history";

const msgHistory = new MessageHistory();

// PRIMARY FUNCTION: chat
export async function chat(userInput, currentKeywords) {
  log("agents", "chat: parsing...");

  // add user input to message history
  msgHistory.add("user", userInput);

  // generate a summary of the current chat history
  const summary = await summarize(msgHistory.pretty());
  log("summary", summary);

  // new specialties are added to existing ones, but capped at 2
  let keywordResponses;
  if (currentKeywords.specialties.length < 2) {
    keywordResponses = await Promise.all([
      parseSpecialty(msgHistory.pretty()),
      parse(summary, "tools"),
      parse(summary, "industries"),
    ]);
    const [specialty, ...rest] = keywordResponses;
    let specialties = [...new Set([specialty, ...currentKeywords.specialties])];
    const skills = await parse(summary, "skills", specialties);
    keywordResponses = [specialties, skills, ...rest];
  } else if (currentKeywords.specialties.length === 2) {
    keywordResponses = await Promise.all([
      Promise.resolve(currentKeywords.specialties),
      parse(summary, "skills", currentKeywords.specialties),
      parse(summary, "tools"),
      parse(summary, "industries"),
    ]);
  }

  const [specialties, skills, tools, industries] = keywordResponses;
  log("agents", "chat: complete.");

  // call the Orchestrate-Agent
  log("agents", "chat: orchestrating...");
  const keywords = { specialties, skills, tools, industries };
  const summaryMessage = summary === "N/A" ? msgHistory.pretty() : summary;
  let response = await orchestrate(summaryMessage, keywords);

  // logic branches based on the function
  const fxnName = response.message.function_call.name;
  const { explanation } = JSON.parse(response.message.function_call.arguments);
  msgHistory.add("assistant", response.message.content);
  if (fxnName === "refocus") {
    response = await refocus(msgHistory.pretty());
  } else if (fxnName === "search") {
    let flatKeywords = Object.values(keywords).flat();
    response = await search(flatKeywords, summaryMessage);
  } else if (fxnName === "followup") {
    response = await followup(msgHistory.pretty(), keywords);
  }
  msgHistory.add("assistant", response.message.content);

  log("agents", "chat: complete.");

  return {
    message: response.message,
    summary,
    keywords,
    action: { name: fxnName, explain: explanation },
  };
}
