import { pprint } from "../../../constants/keywords";
import { log } from "../../../logger";

import openai from "../openai";

export const FOLLOWUP_PROMPT = `
You will be given a chat history between a Hiring Manager, and an AI that manages a team of designers.
You will also be given a set of Keywords that represent the Hiring Manager's needs.
You need to get a deeper understanding of what the Hiring Manager is looking for in a designer.

Follow these steps to craft a followup question:
Step 1: First, use the provided Keywords to come up with 2 examples of work projects or tasks related to the Keywords.  Do this in your head, not in your response
Step 2: Then weave those 2 examples into a followup response that will help the Hiring Manager narrow down their needs

Your entire response should be friendly, conversational, and fewer than 50 words.
`;

export async function followup(chatHistory, keywords) {
  const { specialties } = pprint(keywords);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 1.25,
    frequency_penalty: -1.5,
    messages: [
      {
        role: "system",
        content: FOLLOWUP_PROMPT,
      },
      {
        role: "user",
        content: `
<Keywords>
${specialties ? specialties : "No Specialties"}
<Keywords>

<ChatHistory>
${chatHistory}
</ChatHistory>

AI:
`,
      },
    ],
  });
  const gptMessage = response.choices[0];

  log("agents", "followup: complete");

  return gptMessage;
}
