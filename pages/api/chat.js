import {
  MESSAGE_HISTORY,
  PARSE_CONTEXT,
  SUMMARY_CONTEXT,
  EXPLAIN_CONTEXT,
  GET_MATCHES_FXN,
  TAXONOMY,
} from "../../constants";
import { CREATIVE_DATA } from "../../creative_data";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function summarize(message) {
  MESSAGE_HISTORY.push({
    role: "user",
    content: message,
  });

  const chatHistory = MESSAGE_HISTORY.filter(
    (message) => message.role !== "system"
  );
  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    messages: [
      {
        role: "system",
        content: SUMMARY_CONTEXT,
      },
      {
        role: "user",
        content: JSON.stringify(chatHistory),
      },
    ],
  });

  const gptMessage = response.data.choices[0].message.content;
  const summaries = JSON.parse(gptMessage);

  return summaries;
}

export async function parse(message) {
  const messages = [
    {
      role: "system",
      content: PARSE_CONTEXT,
    },
    {
      role: "user",
      content: message,
    },
  ];
  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.data.choices[0];
  let keywords = JSON.parse(gptMessage.message.content).keywords;
  keywords = [
    ...new Set(
      TAXONOMY.map((term) => {
        if (keywords.includes(term) || keywords.includes(term.toLowerCase())) {
          return term;
        }
      }).filter(Boolean)
    ),
  ];

  return keywords;
}

export async function converse(keywords) {
  MESSAGE_HISTORY.push({
    role: "system",
    content: `Current Selected Tags: ${keywords}`,
  });
  let response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    temperature: 0.25,
    messages: MESSAGE_HISTORY,
    functions: [GET_MATCHES_FXN],
  });

  let gptMessage = response.data.choices[0];
  if (gptMessage.message.content) {
    MESSAGE_HISTORY.push({
      role: "assistant",
      content: gptMessage.message.content,
    });
  }
  return gptMessage;
}

export async function match(keywords) {
  const params = new URLSearchParams(keywords.map((kw) => ["st", kw]));
  const searchUrl = `https://search.meaningfulgigs.com?${params}`;
  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RIVERA_TOKEN}`,
    },
  });

  const matches = await response.json();

  MESSAGE_HISTORY.push({
    role: "function",
    name: "get_matches",
    content: JSON.stringify(matches.slice(0, 3)),
  });

  return matches;
}

export async function explain(topIds, summary) {
  const matchProfiles = topIds.map((id) => CREATIVE_DATA[id]);
  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    temperature: 0.75,
    messages: [
      {
        role: "system",
        content: EXPLAIN_CONTEXT,
      },
      {
        role: "system",
        content: `Creative Profiles (formatted as JSON): ${JSON.stringify(
          matchProfiles
        )}`,
      },
      {
        role: "system",
        content: summary,
      },
    ],
  });

  const gptMessage = response.data.choices[0];
  MESSAGE_HISTORY.push({
    role: "assistant",
    content: gptMessage.message.content,
  });

  return gptMessage;
}
