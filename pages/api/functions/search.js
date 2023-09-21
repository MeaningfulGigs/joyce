import openai from "../openai";

import MessageHistory from "../history";
import { log } from "../../../logger";

const msgHistory = new MessageHistory();
const SEEN_CREATIVES = new Set();

const EXPLAIN = `
  You will be given a summary of a conversation between a Hiring Manager and an AI.
  The conversation is regarding a position for a Creative that the Hiring Manager is trying to fill.
  You will also be given the profile of a Creative professional who is a potential candidate.

  Pretend that you personally selected the Creative for the user. Your job is to explain why the Creative is a good match.
  Use the Creative's profile to specifically connect them with the job requirements. Use projects and skills to create a compelling explanation
  If the Creative has experience with any well-known companies, make sure you mention that too.

  Formatting:
  - Use 2-3 sentences, and only use prose: no bullet points.
  - Use markdown to format your response.  The Creative's name should be **bold**, and any info about the Creative that is aligned with the Hiring Manager's needs should be *italicized*
`;

export async function search(keywords, summary) {
  const params = new URLSearchParams(keywords.map((kw) => ["st", kw.name]));
  const searchUrl = `https://api-dev.meaningfulgigs.com/v1/private/search?${params}`;
  const matchResponse = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHRISTO_TOKEN}`,
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

  const matchProfiles = matches.map((match) => {
    const { _id, name, skills, specialties } = match;
    const highlights = match.highlights.map((highlight) => {
      const { role, description, company, industry } = highlight;
      return {
        role,
        description,
        company,
        industry,
      };
    });

    return {
      _id,
      name,
      skills,
      specialties,
      highlights,
    };
  });

  msgHistory.add("function", JSON.stringify(matchProfiles), "get_matches");

  const responses = await Promise.all(
    matchProfiles.map((profile) => {
      return openai.chat.completions.create({
        model: "gpt-3.5-turbo-0613",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: EXPLAIN,
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

  const explanations = responses
    .map((response) => response.choices[0].message.content)
    .join("<br /><br />");
  msgHistory.add("assistant", JSON.stringify(explanations));

  return {
    matches,
    message: { content: JSON.stringify(explanations) },
  };
}
