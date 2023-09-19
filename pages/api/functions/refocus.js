import openai from "../openai";

export const REFOCUS_PROMPT = `
  You will be given a chat history between a Hiring Manager and an AI.
  The AI manages a team of designers who work in these four fields:
  - UX/UI Product Design
  - Brand & Marketing Design
  - Illustration, Graphic & Visual Storytelling
  - Motion, Video & Animation

  The AI should steer the conversation to the topic of hiring creative professionals.
  They need to understand the Hiring Manager's needs at a high level, in order to connect them with one of their designers.
  But don't list out the fields - that's too robotic.  Just ask a general question about what type of design work they need.
  If they need help in a different field, or if you can't help for any other reason, apologize and explain that you're only trained to help match them with one of our designers.
`;

export async function refocus(chatHistory) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 1,
    messages: [
      {
        role: "system",
        content: REFOCUS_PROMPT,
      },
      {
        role: "user",
        content: `
            <Chat History>
            ${chatHistory}
            <Chat History>
  
            AI:
          `,
      },
    ],
  });

  const gptMessage = response.choices[0];
  return gptMessage;
}
