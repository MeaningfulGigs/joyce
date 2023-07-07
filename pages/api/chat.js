import {
  GPT_MESSAGES,
  QUESTION_CONTEXT,
  TAXONOMY,
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
    GPT_MESSAGES.push({
      role: "user",
      content: `${message}. ${QUESTION_CONTEXT}`,
    });
  } else {
    GPT_MESSAGES.push({
      role: "system",
      content: message,
    });
  }
  let response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
    functions: [GET_MATCHES_FXN],
  });

  let gptMessage = response.data.choices[0];

  // call API if GPT invokes function
  // if (gptMessage.finish_reason === "function_call") {
  //   const gptFunc = gptMessage.message.function_call;

  //   // include GPT response in chat history
  //   GPT_MESSAGES.push({
  //     role: "assistant",
  //     content: null,
  //     function_call: gptFunc,
  //   });

  //   // parse taxonomy keywords from GPT response
  //   keywords = JSON.parse(gptFunc.arguments).keywords;
  //   keywords = [
  //     ...new Set(
  //       TAXONOMY.map((term) => {
  //         if (
  //           keywords.includes(term) ||
  //           keywords.includes(term.toLowerCase())
  //         ) {
  //           return term;
  //         }
  //       }).filter(Boolean)
  //     ),
  //   ];

  //   matches = await getMatches(keywords);

  //   const matches_context = [
  //     {
  //       role: "system",
  //       content: `The following are designer profiles formatted as JSON documents: ${JSON.stringify(
  //         matches
  //       )}. ${ANALYSIS_CONTEXT}`,
  //     },
  //   ];
  //   GPT_MESSAGES.push(...matches_context);
  //   response = await openai.createChatCompletion({
  //     model: "gpt-3.5-turbo-0613",
  //     messages: GPT_MESSAGES,
  //   });

  //   if (response.status !== 200) {
  //     handleError();
  //     return;
  //   }

  //   gptMessage = response.data.choices[0].message;
  //   GPT_MESSAGES.push({
  //     role: "assistant",
  //     content: gptMessage.content,
  //   });
  // }

  // return {
  //   keywords,
  //   matches,
  //   content: response,
  // };
  return gptMessage;
}

export async function getKeywords(gptMessage) {
  const gptFunc = gptMessage.message.function_call;

  // include GPT response in chat history
  GPT_MESSAGES.push({
    role: "assistant",
    content: null,
    function_call: gptFunc,
  });

  // parse taxonomy keywords from GPT response
  let keywords = JSON.parse(gptFunc.arguments).keywords;
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
  console.log(keywords);
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

  return matches.slice(0, 3);
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
  GPT_MESSAGES.push(...matches_context);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
  });

  if (response.status !== 200) {
    handleError();
    return;
  }

  const gptMessage = response.data.choices[0];
  GPT_MESSAGES.push({
    role: "assistant",
    content: gptMessage.message.content,
  });

  return gptMessage;
}
