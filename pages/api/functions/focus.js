import openai from "../openai";

export const FOCUS_PROMPT = `
You will be given a chat history between a Hiring Manager and an AI.
The AI manages a team of designers who work in these 4 Design Fields:
- UX/UI Product Design
- Brand & Marketing Design
- Illustration, Graphic & Visual Storytelling
- Motion, Video & Animation

You need to understand the Hiring Manager's needs at a high level, in order to connect them with one of their designers.

Follow these steps to craft your focusing question:
Step 1: First, use the provided Keywords to come up with 2 examples of work projects or tasks related to the Keywords.  Do this in your head, not in your response
Step 2: Then weave those 2 examples into a followup response that will help the Hiring Manager narrow down their needs

Your entire response should be friendly, conversational, and fewer than 50 words.
`;

export async function focus(chatHistory) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    temperature: 1,
    messages: [
      {
        role: "system",
        content: FOCUS_PROMPT,
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
