import {
  MESSAGE_HISTORY,
  SEEN_CREATIVES,
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

// PRIMARY FUNCTION: chat
export async function chat(userInput) {
  MESSAGE_HISTORY.push({
    role: "user",
    content: userInput,
  });

  // remove system prompts before summarizing/parsing
  const chatHistory = MESSAGE_HISTORY.filter(
    (message) => message.role !== "system"
  );

  // generate a summary of the chat history
  const responses = await Promise.all([
    summarize(chatHistory),
    parse(chatHistory),
  ]);
  const [summaries, keywords] = responses;
  const { shortSummary, longSummary } = summaries;

  MESSAGE_HISTORY.push({
    role: "system",
    content: `Current Selected Tags: ${keywords}`,
  });

  let response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    temperature: 0.5,
    messages: MESSAGE_HISTORY,
    functions: [GET_MATCHES_FXN],
  });

  let gptMessage = response.data.choices[0];
  let chatResponse = gptMessage.message.content;
  if (chatResponse) {
    MESSAGE_HISTORY.push({
      role: "assistant",
      content: chatResponse,
    });
  }

  return {
    type: gptMessage.finish_reason,
    message: chatResponse,
    topic: shortSummary,
    summary: longSummary,
    keywords,
  };
}

export async function match(keywords, summary) {
  const params = new URLSearchParams(keywords.map((kw) => ["st", kw]));
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

  const response = await openai.createChatCompletion({
    model: "gpt-4-0613",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: EXPLAIN_CONTEXT,
      },
      {
        role: "user",
        content: `Creative Profiles (formatted as JSON):\n\
                  ${JSON.stringify(matchProfiles)}\n\n\
                  Summary:\n\
                  ${summary}`,
      },
    ],
  });

  const explanations = response.data.choices[0].message.content;
  MESSAGE_HISTORY.push({
    role: "assistant",
    content: explanations,
  });

  return {
    matches,
    message: explanations,
  };
}

export async function summarize(chatHistory) {
  const messages = [
    {
      role: "system",
      content: SUMMARY_CONTEXT,
    },
    {
      role: "user",
      content: JSON.stringify(chatHistory),
    },
  ];
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    temperature: 0,
    messages,
  });

  const gptMessage = response.data.choices[0].message.content;
  const summaries = JSON.parse(gptMessage);

  return summaries;
}

export async function parse(chatHistory) {
  const messages = [
    {
      role: "system",
      content: PARSE_CONTEXT,
    },
    {
      role: "user",
      content: JSON.stringify(chatHistory),
    },
  ];
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
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
