import { SKILL_MAP, TOOLS, INDUSTRIES } from "../../../constants/keywords";
import { log } from "../../../logger";

import openai from "../openai";

const PARSE_SPECIALTY = `
  You will be provided with a summary of a conversation between a Hiring Manager and an AI.
  You will also be provided with a list of Design Specialties.
  
  Step 1 - Use the Design Specialties list to select the most relevant specialty to the Hiring Manager's needs, if one exists. If none of the specialties are relevant, respond with "None".
  Step 2 - Write an explanation for why you selected it (or selected "None").
  Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"name": <SPECIALTY_NAME>, "explain": <SELECTION_EXPLANATION>}
`;

export async function parseSpecialty(summary) {
  const specialtyList = Object.keys(SKILL_MAP);
  const messages = [
    {
      role: "system",
      content: PARSE_SPECIALTY,
    },
    {
      role: "user",
      content: `
<Summary>
${summary}
</Summary>

<DesignSpecialties>
UX/UI Product Design
Brand & Marketing Design
Illustration, Graphic & Visual Storytelling
Motion, Video & Animation
</DesignSpecialties>

Answer as RFC-8259 compliant JSON:
`,
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];
  const gptSpecialty = JSON.parse(gptMessage.message.content);

  let topSpecialty;
  if (gptSpecialty.name == "None") {
    topSpecialty = gptSpecialty;
  } else {
    const match = specialtyList.find((s) => s === gptSpecialty.name);
    if (match) {
      topSpecialty = gptSpecialty;
    } else {
      topSpecialty = {
        name: "Bad Parsing",
        explain: `${gptSpecialty.name} / ${gptSpecialty.explain}`,
      };
    }
  }

  return topSpecialty;
}

//
//  GENERAL PURPOSE PARSER
//

const PARSE_SKILLS = `
You will be provided with a summary of a Hiring Manager's needs.  The Hiring Manager is seeking a design professional for work they need done.
You will also be provided with a list of Design Skills.  You will be selecting no more than 2 skills from the list.
Only select skills that are less specific than the Hiring Manager's needs.  If no skills are relevant, reply with an empty array.

Follow these steps:
Step 1 - Use the Design Skills list up to 2 relevant keywords from the Chat History.  They MUST be spelled EXACTLY as in the Design Skills List.
Step 2 - For each selected keyword, write a one-sentence explanation its relevance and why you selected it.
Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"keywords": [{"name": <KEYWORD_NAME>, "explain": <SELECTION_EXPLANATION>}, ...]}
`;

const PARSE_TOOLS = `
You will be provided with a Chat History between a Hiring Manager and an AI.
You will also be provided with a list of Design Tools.  You will be selecting 0 to 3 tools that are explicitly discussed in the Chat History.

Follow these steps:
Step 1 - Select relevant keywords from the Design Tools list.  They MUST be spelled EXACTLY as in the Design Tools List.
Step 2 - For each selected keyword, write a one-sentence explanation its relevance and why you selected it.
Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"keywords": [{"name": <KEYWORD_NAME>, "explain": <SELECTION_EXPLANATION>}, ...]}
`;

const PARSE_INDUSTRIES = `
You will be provided with a Chat History between a Hiring Manager and an AI.  The Hiring Manager is seeking a Creative professional for work they need done.
You will also be provided with a list of Industries. Use the list to select Industry Experience that the Hiring Manager has explciitly stated they need.
If the Hiring Manager has not explicitly mentioned needing any specific Industry experience, respond with with "N/A"

Follow these steps:
Step 1 - Select keywords from the Industries list that the Hiring Manager has explicitly mentioned.  They MUST be spelled EXACTLY as in the Industries List.
Step 2 - For each selected keyword, write a one-sentence explanation of why you selected it.
Step 3 - Provide your answer as RFC-8259 compliant JSON in the following format: {"keywords": [{"name": <KEYWORD_NAME>, "explain": <SELECTION_EXPLANATION>}, ...]}
`;

export async function parse(summary, datatype, specialties) {
  // use specialties to collect relevant skill keywords
  const keywordArray =
    datatype === "industries"
      ? INDUSTRIES
      : datatype === "tools"
      ? TOOLS
      : specialties.flatMap((specialty) => SKILL_MAP[specialty.name]);

  const messages = [
    {
      role: "system",
      content:
        datatype === "industries"
          ? PARSE_INDUSTRIES
          : datatype === "tools"
          ? PARSE_TOOLS
          : PARSE_SKILLS,
    },
    {
      role: "system",
      content: `
            <${datatype.toUpperCase()}>
            ${keywordArray}
            </${datatype.toUpperCase()}>
          `,
    },
    {
      role: "user",
      content: `
<Summary>
${summary}
</Summary>
`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];

  // retrieve keywords from GPT response, and filter
  // against the taxonomy keywords to ensure a match
  let keywords = JSON.parse(gptMessage.message.content).keywords;
  const cleanKeywords = keywords.filter((kw) => keywordArray.includes(kw.name));

  log("agents", `parse: complete (${datatype})`);

  return cleanKeywords;
}
