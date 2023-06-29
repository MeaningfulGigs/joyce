import { GPT_MESSAGES, TAXONOMY } from "../../constants";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getKeywords(userInput) {
  GPT_MESSAGES.push({
    role: "user",
    content: userInput,
  });
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
  });

  let gptMessage = response.data.choices[0].message;

  // include GPT response in chat history
  GPT_MESSAGES.push({
    role: "assistant",
    content: gptMessage.content,
  });

  // parse taxonomy keywords from GPT response
  const keywords = [
    ...new Set(
      TAXONOMY.map((term) => {
        if (
          gptMessage.content.includes(term) ||
          gptMessage.content.includes(term.toLowerCase())
        ) {
          return term;
        }
      }).filter(Boolean)
    ),
  ];

  return {
    content: gptMessage.content,
    keywords,
  };
}

export async function getMatches(keywords) {
  const params = new URLSearchParams(keywords.map((kw) => ["st", kw]));
  const searchUrl = `https://search-dev.meaningfulgigs.com?${params}`;
  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RIVERA_TOKEN}`,
    },
  });

  const matches = await response.json();

  return matches.slice(0, 3);
}

export async function getSummary(matches) {
  const matches_context = [
    {
      role: "assistant",
      content:
        "The following JSON documents are profiles of different designers that were found to be similar to your needs.",
    },
    {
      role: "assistant",
      content: JSON.stringify(matches),
    },
  ];
  GPT_MESSAGES.push(...matches_context);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
  });

  if (response.status !== 200) {
    handleError();
    return;
  }

  const gptMessage = response.data.choices[0].message;
  GPT_MESSAGES.push({
    role: "assistant",
    content: gptMessage.content,
  });

  return gptMessage.content;
}
