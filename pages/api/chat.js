import {
  orchestrate,
  summarize,
  parse,
  followup,
  match,
  refocus,
} from "./functions";

import OpenAI from "openai";
import MessageHistory from "./history";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const msgHistory = new MessageHistory();

// PRIMARY FUNCTION: chat
export async function chat(userInput) {
  // add user input to message history
  msgHistory.add("user", userInput);
  console.log(msgHistory.pretty());

  // generate a summary of the chat history
  // and extract taxonomy keywords from it
  const responses = await Promise.all([
    summarize(msgHistory.pretty()),
    parse(msgHistory.chat),
  ]);
  const [summary, keywords] = responses;

  const summaryMessage = `
    Summary:
    ${summary}
  `;

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

  return {
    message: response.message,
    summary,
    keywords,
    action: fxnName,
  };
}
