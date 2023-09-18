import { GPT_FUNCTIONS } from "../../../constants/gptFunctions";

import openai from "../openai";

const ORCHESTRATE = `
  You will be given design-related Keywords that represent a conversation Summary between a Hiring Manager and an AI.
  The AI is the manager of a team of Creative professionals, and is assisting the Hiring Manager in their search.
  Based on the Keywords provided, you have to decide what the AI should do next.

  You will be given a set of functions that represent the different actions you can take.
  Your job is to call the function that takes the best action given the conversation so far.
  
  You MUST ALWAYS call one of the functions that you have been provided.
`;

export async function orchestrate(summary, keywords) {
  // convert keyword objects into array of names
  const specialties = keywords.specialties
    .map((s) => `<Specialty>${s.name}</Specialty>`)
    .join("\n");
  const skills = keywords.skills
    .map((s) => `<Skill>${s.name}</Skill>`)
    .join("\n");
  const tools = keywords.tools.map((t) => `<Tool>${t.name}</Tool>`).join("\n");
  const industries = keywords.industries
    .map((i) => `<Industry>${i.name}</Industry>`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4-0613",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: ORCHESTRATE,
      },
      {
        role: "user",
        content: `
            <Summary>
            ${summary}
            </Summary>
  
            <Keywords>
            ${specialties ? specialties : "No Specialties"}
            ${skills ? skills : "No Skills"}
            ${tools ? tools : "No Tools"}
            ${industries ? industries : "No Industries"}
            </Keywords>
          `,
      },
    ],
    functions: GPT_FUNCTIONS,
  });

  const gptMessage = response.choices[0];

  if (gptMessage.finish_reason !== "function_call") {
    const content = gptMessage.message.content;
    if (content.startsWith("functions")) {
      const fxnName = content.replace("functions.", "").replace("()", "");
      return {
        message: { function_call: { name: fxnName, arguments: [] } },
      };
    }
  }
  return gptMessage;
}
