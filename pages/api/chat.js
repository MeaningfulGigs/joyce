import {
  MESSAGE_HISTORY,
  TAXONOMY,
  MATCHING_CONTEXT,
  ANALYSIS_CONTEXT,
  GET_MATCHES_FXN,
} from "../../constants";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function converse(message, role) {
  if (role == "user") {
    MESSAGE_HISTORY.push({
      role: "user",
      content: message,
    });
    MESSAGE_HISTORY.push({
      role: "system",
      content: MATCHING_CONTEXT,
    });
  } else {
    MESSAGE_HISTORY.push({
      role: "system",
      content: message,
    });
  }
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

export async function getKeywords(gptMessage) {
  const gptFunc = gptMessage.message.function_call;

  // add function call to chat history
  MESSAGE_HISTORY.push({
    role: "assistant",
    content: null,
    function_call: gptFunc,
  });

  // parse taxonomy keywords from function arguments
  const args = JSON.parse(gptFunc.arguments);
  let keywords = args.keywords.map((arg) => arg.toLowerCase());
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

export async function getMatches(keywords) {
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

export async function getSummary(matches) {
  const matches_context = [
    {
      role: "system",
      content: `The following are designer profiles formatted as JSON documents: ${JSON.stringify(
        matches
      )}. ${ANALYSIS_CONTEXT}`,
    },
  ];
  MESSAGE_HISTORY.push(...matches_context);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: MESSAGE_HISTORY,
  });

  if (response.status !== 200) {
    handleError();
    return;
  }

  const gptMessage = response.data.choices[0];
  MESSAGE_HISTORY.push({
    role: "assistant",
    content: gptMessage.message.content,
  });

  return gptMessage;
}
