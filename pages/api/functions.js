import {
  SKILL_MAP,
  MESSAGE_HISTORY,
  SEEN_CREATIVES,
  ORCHESTRATE_CONTEXT,
  SPECIALTY_CONTEXT,
  PARSE_CONTEXT,
  SUMMARIZE_CONTEXT,
  EXPLAIN_CONTEXT,
  REFOCUS_CONTEXT,
  GPT_FUNCTIONS,
  FOLLOWUP_CONTEXT,
  FOLLOWUP_EXAMPLES,
} from "../../constants";

import { CREATIVE_DATA } from "../../creative_data";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function orchestrate(summary) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: ORCHESTRATE_CONTEXT,
      },
      {
        role: "system",
        content: `
          Summary:
          ${summary}
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

export async function summarize(chatHistory) {
  const messages = [
    {
      role: "system",
      content: SUMMARIZE_CONTEXT,
    },
    {
      role: "system",
      content: `
        Chat History:
        ${chatHistory}
      `,
    },
    {
      role: "user",
      content:
        "Hi there!  I hear you're a Hiring Manger with design needs.  Tell me about them!",
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];
  return gptMessage.message.content;
}

export async function parseSkills(chatHistory) {
  const specialtyList = Object.keys(SKILL_MAP);
  let messages = [
    {
      role: "system",
      content: SPECIALTY_CONTEXT,
    },
    {
      role: "system",
      content: `
        <DesignSpecialties>
        ${specialtyList.toString().replace(",", "\n")}
        </DesignSpecialties>
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

  let response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];
  const gptSpecialties = JSON.parse(gptMessage.message.content).specialties;
  const specialties = gptSpecialties.filter((s) =>
    specialtyList.includes(s.name)
  );

  const skillsList = specialties.flatMap(
    (specialty) => SKILL_MAP[specialty.name]
  );
  const skills = await parse(chatHistory, skillsList.toString());

  return {
    specialties,
    skills,
  };
}

export async function parse(chatHistory, keywordList) {
  const messages = [
    {
      role: "system",
      content: PARSE_CONTEXT,
    },
    {
      role: "system",
      content: `
        <KeywordList>
        ${keywordList}
        </KeywordList>
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

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.choices[0];
  let keywords = JSON.parse(gptMessage.message.content).keywords;
  const keywordArray = keywordList.split(",").map((kw) => kw.trim());
  const cleanKeywords = keywords.filter((kw) => keywordArray.includes(kw.name));

  return cleanKeywords;
}

//
// ACTION:
// ASK A FOLLOWUP QUESTION
//
export async function followup(summary) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          ${FOLLOWUP_CONTEXT}

          ${FOLLOWUP_EXAMPLES}
        `,
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

//
// ACTION:
// GET POSSIBLE MATCHES
//
export async function match(keywords, summary) {
  const params = new URLSearchParams(keywords.skills.map((kw) => ["st", kw]));
  const searchUrl = `https://search.meaningfulgigs.com?${params}`;
  const matchResponse = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RIVERA_TOKEN}`,
    },
  });
  let matches = await matchResponse.json();

  // filter out any candidates that have already been shown
  matches = matches.filter((m) => !SEEN_CREATIVES.has(m["_id"]));

  // reduce to the Top 3
  matches = matches.slice(0, 3);
  const topIds = matches.map((c) => c._id);

  // add Top 3 results to history of seen candidates
  topIds.map((id) => SEEN_CREATIVES.add(id));

  // retrieve profiles for the Top 3 matches
  const matchProfiles = topIds.map((id) => CREATIVE_DATA[id]);

  MESSAGE_HISTORY.push({
    role: "function",
    name: "get_matches",
    content: JSON.stringify(matchProfiles),
  });

  const responses = await Promise.all(
    matchProfiles.map((profile) => {
      return openai.chat.completions.create({
        model: "gpt-4-0613",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: EXPLAIN_CONTEXT,
          },
          {
            role: "user",
            content: `
                Creative Profile (as JSON):
                ${JSON.stringify(profile)}
    
                Summary:
                ${summary}
            `,
          },
        ],
      });
    })
  );

  const explanations = responses.map(
    (response) => response.choices[0].message.content
  );
  MESSAGE_HISTORY.push({
    role: "assistant",
    content: explanations,
  });

  return {
    matches,
    message: explanations,
  };
}

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
        content: REFOCUS_CONTEXT,
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
