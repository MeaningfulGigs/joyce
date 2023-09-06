import {
  orchestrate,
  summarize,
  parse,
  parseSkills,
  followup,
  match,
  refocus,
} from "./functions";

import { SKILLS, TOOLS, INDUSTRIES } from "../../constants";

import MessageHistory from "./history";

const msgHistory = new MessageHistory();

// PRIMARY FUNCTION: chat
export async function chat(userInput) {
  // add user input to message history
  msgHistory.add("user", userInput);

  // generate a summary of the chat history
  // and extract taxonomy keywords from it
  const responses = await Promise.all([
    summarize(msgHistory.pretty()),
    parseSkills(msgHistory.pretty()),
    parse(msgHistory.pretty(), TOOLS),
    parse(msgHistory.pretty(), INDUSTRIES),
  ]);
  const [summary, { specialties, skills }, tools, industries] = responses;
  const keywords = { specialties, skills, tools, industries };

  const summaryMessage = summary === "N/A" ? msgHistory.pretty() : summary;

  // call the Orchestrate-Agent
  let response = await orchestrate(summaryMessage);

  const fxnName = response.message.function_call.name;
  const fxnArgs = response.message.function_call.arguments;

  if (fxnName === "refocus") {
    response = await refocus(summaryMessage);
  } else if (fxnName === "get_creative_matches") {
    response = await match(keywords, summaryMessage);
  } else if (fxnName === "ask_followup") {
    response = await followup(summaryMessage);
  }
  msgHistory.add("assistant", response.message.content);

  return {
    message: response.message,
    summary,
    keywords,
    action: fxnName,
  };
}
