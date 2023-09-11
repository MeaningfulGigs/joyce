import {
  orchestrate,
  summarize,
  parse,
  parseSpecialties,
  followup,
  refocus,
} from "./functions";

import { log, logSummary } from "../../logger";

import MessageHistory from "./history";

const msgHistory = new MessageHistory();

// PRIMARY FUNCTION: chat
export async function chat(userInput) {
  log("chat: parsing...");
  // add user input to message history
  msgHistory.add("user", userInput);

  // generate a summary of the chat history
  // and extract taxonomy keywords from it
  const summary = await summarize(msgHistory.pretty());
  const specialties = await parseSpecialties(summary);
  logSummary(summary);

  const keywordResponses = await Promise.all([
    parse(summary, "skills", specialties),
    parse(summary, "tools", specialties),
    parse(summary, "industries", specialties),
  ]);
  const [skills, tools, industries] = keywordResponses;

  // call the Orchestrate-Agent
  const keywords = { specialties, skills, tools, industries };
  const summaryMessage = summary === "N/A" ? msgHistory.pretty() : summary;
  log("chat: orchestrating...");
  let response = await orchestrate(summaryMessage, keywords);

  const fxnName = response.message.function_call.name;
  const { explanation } = JSON.parse(response.message.function_call.arguments);

  if (fxnName === "refocus") {
    response = await refocus(summaryMessage);
  } else if (fxnName === "search") {
    // response = await match(keywords, summaryMessage);
    response = {
      message: "We're matching!",
    };
  } else if (fxnName === "followup") {
    response = await followup(msgHistory.pretty(), keywords);
  }
  msgHistory.add("assistant", response.message.content);

  return {
    message: response.message,
    summary,
    keywords,
    action: { name: fxnName, explain: explanation },
  };
}
