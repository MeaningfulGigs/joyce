import {
  SPECIALTY_FOLLOWUP,
  SKILLS_TOOLS_FOLLOWUP,
} from "../../../constants/contexts";

import openai from "../openai";

export async function followup(chatHistory, keywords) {
  let messages = [];
  if (keywords.specialties.length == 0) {
    messages.push({
      role: "system",
      content: `
            ${SPECIALTY_FOLLOWUP}
          `,
    });
  } else {
    messages.push({
      role: "system",
      content: `
            ${SKILLS_TOOLS_FOLLOWUP}
          `,
    });
  }

  messages.push({
    role: "user",
    content: `
        <ChatHistory>
        ${chatHistory}
        </ChatHistory>
  
        AI:
      `,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0.5,
    messages,
  });

  const gptMessage = response.choices[0];
  return gptMessage;
}
