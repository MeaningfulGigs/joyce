import { GPT_FUNCTIONS, ORCHESTRATE_CONTEXT } from "../../constants";
import { summarize, parse } from "./functions";

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
  const { topic, description } = summary;

  const summaryMessage = `
    Summary:
    ${topic}
    ${description}
  `;

  let response = await openai.chat.completions.create({
    model: "gpt-4-0613",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: ORCHESTRATE_CONTEXT,
      },
      {
        role: "system",
        content: summaryMessage,
      },
    ],
    functions: GPT_FUNCTIONS,
  });

  // parse response and add to chat history
  let gptMessage = response.choices[0];
  let chatResponse = gptMessage.message.content;
  if (chatResponse) {
    msgHistory.add("assistant", chatResponse);
  }

  return {
    type: gptMessage.finish_reason,
    message: chatResponse,
    topic,
    description,
    keywords,
  };
}
