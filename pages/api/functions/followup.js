import { pprint } from "../../../constants/keywords";
import { log } from "../../../logger";

import openai from "../openai";

export const FOLLOWUP_PROMPT = `
You will be given a chat history between a Hiring Manager and an AI.  You are the AI.
You will also be given a set of Keywords that represent the Hiring Manager's needs.

You need to get a deeper understanding of what skills and tools the Hiring Manager is specifically looking for.
First, reassure the Hiring Manager that you can help.
Then, ask them a followup question to get more information.  Follow these steps to craft the follow-up question:

Step 1: Take the Specialty keywords and come up with some examples of work that is done in those specialties
Step 2: Ask the Hiring Manager to narrow down their needs, giving them some of the examples you came up with to help guide them

You are an expert, but your tone should be friendly and informal throughout.  Here are some examples of the tone and structure of a good answer:
Example 1:
I can already think of a few Creatives who might be a good fit!  Let's get a little more specific: what kind of motion work would they be doing? Are you looking to bring life to static assets  - like a title sequence movie, or a 2 min explainer video

Example 2:
OK, I'm getting a better understanding of what you're looking for.  Are there any specific tools your team uses that you'd need the Creative to be skilled in?
`;

export async function followup(chatHistory, keywords) {
  const { specialties, skills, tools, industries } = pprint(keywords);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0.75,
    messages: [
      {
        role: "system",
        content: FOLLOWUP_PROMPT,
      },
      {
        role: "user",
        content: `
<ChatHistory>
${chatHistory}
</ChatHistory>

<Keywords>
${specialties ? specialties : "No Specialties"}
${skills ? skills : "No Skills"}
${tools ? tools : "No Tools"}
${industries ? industries : "No Industries"}
<Keywords>

AI:
`,
      },
    ],
  });
  const gptMessage = response.choices[0];

  log("agents", "followup: complete");

  return gptMessage;
}
