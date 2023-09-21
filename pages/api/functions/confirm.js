import { pprint } from "../../../constants/keywords";

import openai from "../openai";

export const CONFIRM_PROMPT = `
You will be given a chat history between a Hiring Manager and an AI.  You are the AI.
You have a basic understanding of what type of design the Hiring Manager needs done, designated by the keywords you have been provided.

You are about to perform a search in your database of expert designers.  Ask a general "anything else?" type of question to make sure you're not missing any crucial information.
Your entire response should be friendly, conversational, and fewer than 50 words.

Here are some examples of the tone and structure of a good answer.
Example 1:
OK, I think I have everything I need to pull some candidates for you.  Would you like to tell me anything else you think might assist my search?  For instance, a specific personality that you're looking for in a Creative, or industry experience that would be a bonus?

Example 2:
Got it — this is great, you've given me a lot of helpful information about what you're looking for, and I think we're aligned.  Is there anything else that we missed before I find some potential matches for you?

Example 3:
Absolutely, we have folks who can help.  Before I show you some candidates, is there any more context you'd like to give on what this for?  That can sometimes help me connect you with someone who fits your team and brand well.
`;

export async function confirm(chatHistory, keywords) {
  const { specialties, skills, tools, industries } = pprint(keywords);
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: CONFIRM_PROMPT,
      },
      {
        role: "user",
        content: `
    <ChatHistory>
    ${chatHistory}
    </ChatHistory>
    
    <Keywords>
    ${specialties ? specialties : "No Specialties"}
    ${skills ? skills : "No Skills"}
    ${tools ? tools : "No Tools"}
    ${industries ? industries : "No Industries"}
    <Keywords>
    
    AI:
    `,
      },
    ],
  });

  const gptMessage = response.choices[0];
  return gptMessage;
}
