import { GPT_FUNCTIONS } from "../../../constants/gptFunctions";
import { pprint } from "../../../constants/keywords";
import { log } from "../../../logger";

import openai from "../openai";

const ORCHESTRATE = `
You will be given a Summary of a Hiring Manager's needs in hiring a design professional.
You will also be given Keywords that summarize the Hiring Manager's needs.

Based on the Summary and Keywords provided, you have to decide what the AI should do next.
You will be given a set of functions that represent the different actions you can take.
Your job is to call the function that takes the best action given the conversation so far.

You MUST ALWAYS call one of the functions that you have been provided.
`;

export async function orchestrate(summary, keywords) {
  log("agents", "orchestrate: selecting action...");
  const { specialties, skills, tools, industries } = pprint(keywords);
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

  log("agents", "orchestrate: complete.");

  return gptMessage;
}
