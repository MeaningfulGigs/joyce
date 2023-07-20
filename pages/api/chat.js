import {
  MESSAGE_HISTORY,
  TAXONOMY,
  ANALYSIS_CONTEXT,
  GET_MATCHES_FXN,
} from "../../constants";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.25,
  frequency_penalty: -1,
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
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content: `You will receive a chat history between a user and an AI.  Your task is to provide TWO summaries of the chat history.  They must be from the user's point-of-view.\n\n\
                  The only difference between the two summaries is the length.  One must be 8 words or fewer ("short-summary"). The other should be about a paragraph ("long-summary").\n\
                  If there's not enough information, respond with 'N/A' instead of making up facts.\n\n
                  Format your answer as JSON in the following format: {"shortSummary": {short-summary}, "longSummary": {long-summary}}`,
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
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content: `You will be presented with a summary of a conversation between a user and an AI and your job is to provide a set of tags from a list you are given.\n\n\
                  There are two rules to how you can choose the tags:\n\
                  (1) They MUST come from this list and spelled identically: ${TAXONOMY}\n\
                  (2) They MUST be relevant to the needs of the user in the conversation\n\n\
                  Provide your answer as JSON in the following format: {"keywords": [{tag1}, {tag2}, ...]}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
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
    model: "gpt-3.5-turbo-0613",
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

export async function explain(matches, summary) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content: ANALYSIS_CONTEXT,
      },
      {
        role: "system",
        content: `Designer Profiles (formatted as JSON): ${JSON.stringify(
          matches
        )}`,
      },
      {
        role: "user",
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
