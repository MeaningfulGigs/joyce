import { SUMMARIZE } from "../../../constants/contexts";

import openai from "../openai";
import { log } from "../../../logger";

export async function summarize(chatHistory) {
  const messages = [
    {
      role: "system",
      content: SUMMARIZE,
    },
    {
      role: "user",
      content: `
          <ChatHistory>
          ${chatHistory}
          </ChatHistory>
  
          Summary:
        `,
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  log("summarize: complete");

  const gptMessage = response.choices[0];
  return gptMessage.message.content;
}
