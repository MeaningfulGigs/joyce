import { SKILL_MAP, TOOL_MAP, INDUSTRIES } from "../../constants/keywords";

import {
  ORCHESTRATE,
  PARSE_SPECIALTY,
  PARSE_SKILLS,
  PARSE_TOOLS,
  PARSE_INDUSTRIES,
  SUMMARIZE,
  EXPLAIN,
  REFOCUS,
  SPECIALTY_FOLLOWUP,
  SKILLS_TOOLS_FOLLOWUP,
} from "../../constants/contexts";

import { GPT_FUNCTIONS } from "../../constants/gptFunctions";

import { log } from "../../logger";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function orchestrate(summary, keywords) {
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
  log("orchestrate: complete");
  return gptMessage;
}

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

  const gptMessage = response.choices[0];
  log("summarize: complete");
  return gptMessage.message.content;
}

export async function parseSpecialties(summary) {
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
  const gptSpecialties = JSON.parse(gptMessage.message.content).specialties;
  const specialties = gptSpecialties.filter((s) =>
    specialtyList.includes(s.name)
  );

  log("parse: complete (specialties)");

  return specialties;
}

export async function parse(chatHistory, datatype, specialties) {
  let messages;
  let keywordArray;
  if (datatype == "skills") {
    keywordArray = specialties.flatMap(
      (specialty) => SKILL_MAP[specialty.name]
    );
    messages = [
      {
        role: "system",
        content: PARSE_SKILLS,
      },
      {
        role: "system",
        content: `
          <DesignSkills>
          ${keywordArray}
          </DesignSkills>
        `,
      },
      {
        role: "user",
        content: `
          <ChatHistory>
          ${chatHistory}
          </ChatHistory>
        `,
      },
    ];
  } else if (datatype == "tools") {
    keywordArray = specialties.flatMap((specialty) => TOOL_MAP[specialty.name]);
    messages = [
      {
        role: "system",
        content: PARSE_TOOLS,
      },
      {
        role: "system",
        content: `
          <DesignTools>
          ${keywordArray}
          </DesignTools>
        `,
      },
      {
        role: "user",
        content: `
          <ChatHistory>
          ${chatHistory}
          </ChatHistory>
        `,
      },
    ];
  } else if (datatype == "industries") {
    keywordArray = INDUSTRIES;
    messages = [
      {
        role: "system",
        content: PARSE_INDUSTRIES,
      },
      {
        role: "system",
        content: `
          <Industries>
          ${keywordArray}
          </Industries>
        `,
      },
      {
        role: "user",
        content: `
          <ChatHistory>
          ${chatHistory}
          </ChatHistory>
        `,
      },
    ];
  } else {
    return None;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];
  let keywords = JSON.parse(gptMessage.message.content).keywords;
  const cleanKeywords = keywords.filter((kw) => keywordArray.includes(kw.name));

  log(`parse: complete (${datatype})`);

  return cleanKeywords;
}

//
// ACTION:
// ASK A FOLLOWUP QUESTION
//
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
    model: "gpt-4-0613",
    temperature: 0.25,
    messages,
  });

  const gptMessage = response.choices[0];
  return gptMessage;
}

//
// ACTION:
// GET POSSIBLE MATCHES
//
// export async function match(keywords, summary) {
//   console.log(keywords);
//   const params = new URLSearchParams(keywords.skills.map((kw) => ["st", kw]));
//   const searchUrl = `https://search.meaningfulgigs.com?${params}`;
//   const matchResponse = await fetch(searchUrl, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.RIVERA_TOKEN}`,
//     },
//   });
//   let matches = await matchResponse.json();

//   // filter out any candidates that have already been shown
//   matches = matches.filter((m) => !SEEN_CREATIVES.has(m["_id"]));

//   // reduce to the Top 3
//   matches = matches.slice(0, 3);
//   const topIds = matches.map((c) => c._id);

//   // add Top 3 results to history of seen candidates
//   topIds.map((id) => SEEN_CREATIVES.add(id));

//   // retrieve profiles for the Top 3 matches
//   const matchProfiles = topIds.map((id) => CREATIVE_DATA[id]);

//   MESSAGE_HISTORY.push({
//     role: "function",
//     name: "get_matches",
//     content: JSON.stringify(matchProfiles),
//   });

//   const responses = await Promise.all(
//     matchProfiles.map((profile) => {
//       return openai.chat.completions.create({
//         model: "gpt-3.5-turbo-0613",
//         temperature: 0.5,
//         messages: [
//           {
//             role: "system",
//             content: EXPLAIN,
//           },
//           {
//             role: "user",
//             content: `
//                 Creative Profile (as JSON):
//                 ${JSON.stringify(profile)}

//                 Summary:
//                 ${summary}
//             `,
//           },
//         ],
//       });
//     })
//   );

//   const explanations = responses.map(
//     (response) => response.choices[0].message.content
//   );
//   MESSAGE_HISTORY.push({
//     role: "assistant",
//     content: explanations,
//   });

//   return {
//     matches,
//     message: explanations,
//   };
// }

//
// ACTION:
// REFOCUS THE CONVERSATION
//
export async function refocus(summary) {
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
