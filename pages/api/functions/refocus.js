import { REFOCUS } from "../../../constants/contexts";

import openai from "../openai";

export default async function refocus(summary) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 1,
    messages: [
      {
        role: "system",
        content: REFOCUS,
      },
      {
        role: "user",
        content: `
            Summary:
            ${summary}
  
            AI:
          `,
      },
    ],
  });

  const gptMessage = response.choices[0];
  return gptMessage;
}
