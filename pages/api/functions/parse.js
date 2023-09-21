import {
  SKILL_MAP,
  TOOLS,
  INDUSTRIES,
  isKeyword,
  unflatten,
} from "../../../constants/keywords";
import { log } from "../../../logger";

import openai from "../openai";

//
//  SPECIALTY PARSER
//

const PARSE_SPECIALTY_PROMPT = `
You will be provided with a summary of a Hiring Manager's needs.  Your job is to respond with the most relevant Keyword from a provided list.

Follow these steps to craft a response:
Step 1 - From the 4 Specialties provided, select the one that is most relevant to the Hiring Manager's needs
Step 2 - When selecting a Specialty, respond with the "name" spelled IDENTICALLY as it is in the provided list, and "explain" why you selected it
Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"specialty": {"name": <SPECIALTY_NAME>, "explain": <SELECTION_EXPLANATION>}}

Note: Choose ONLY from these specialties and spell it IDENTICALLY in your response:
<Specialties>
${Object.keys(SKILL_MAP).join("\n")}
</Specialties>
`;

export async function parseSpecialty(summary) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: PARSE_SPECIALTY_PROMPT,
      },
      {
        role: "user",
        content: `
<Summary>
${summary}
</Summary>
`,
      },
    ],
  });
  const gptMessage = response.choices[0];

  // filter against the taxonomy keywords to ensure a match
  const specialtyResponse = JSON.parse(gptMessage.message.content).specialty;

  log("agents", "parse specialty: complete");

  return isKeyword(specialtyResponse.name) ? specialtyResponse : null;
}

//
//  GENERAL PURPOSE PARSER
//

const PARSE_PROMPT = `
You will be provided with a summary of a Hiring Manager's needs.  Your job is to respond with Keywords from a provided list.

Follow these steps:
Step 1 - Select Keywords that are highly-relevant to the summary.  YOU ARE LIMITED TO 2 "Skills" KEYWORDS.
Step 2 - For each Keyword that you select, "explain" why you selected it.
Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"keywords": [{"name": <KEYWORD_SPELLED_IDENTICALLY>, "explain": <SELECTION_EXPLANATION>}, ...]}
Note: Choose ONLY from this Keywords list and spell each Keyword IDENTICALLY in your response:
<Skills>
${Object.values(SKILL_MAP).flat().join("\n")}
</Skills>

<Tools>
${TOOLS.join("\n")}
</Tools>

<Industries>
${INDUSTRIES.join("\n")}
</Industries>
`;

export async function parse(summary) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: PARSE_PROMPT,
      },
      {
        role: "user",
        content: `
<Summary>
${summary}
</Summary>
`,
      },
    ],
  });

  const gptMessage = response.choices[0];

  // retrieve keywords from GPT response, and filter
  // against the taxonomy keywords to ensure a match
  const keywordsResponse = JSON.parse(gptMessage.message.content).keywords;
  const cleanKeywords = keywordsResponse.filter((kw) => isKeyword(kw.name));
  const keywords = unflatten(cleanKeywords);

  log("agents", "parse: complete");

  return keywords;
}
