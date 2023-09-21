import {
  orchestrate,
  summarize,
  parse,
  parseSpecialty,
  refocus,
  followup,
  confirm,
  search,
} from "./functions";

import { log } from "../../logger";

import MessageHistory from "./history";

const msgHistory = new MessageHistory();

// PRIMARY FUNCTION: chat
export async function chat(userInput, currKeywords) {
  log("agents", "chat: crafting response...");

  // add user input to message history
  msgHistory.add("user", userInput);

  // generate a summary of the current chat history
  const summary = await summarize(msgHistory.pretty());
  log("summary", summary);

  // log("agents", "chat: sleeping...");
  // await new Promise((r) => setTimeout(r, 1000));

  // new specialties are added to existing ones, but capped at 2
  const responses = await Promise.all([
    parseSpecialty(summary),
    parse(summary),
  ]);
  const [newSpecialty, newKeywords] = responses;
  const { skills, tools, industries } = newKeywords;
  const existingKeywords = Object.values(currKeywords)
    .flat()
    .map((kw) => kw.name);

  // add specialty to existing parsed
  if (
    currKeywords.specialties.length < 2 &&
    !existingKeywords.includes(newSpecialty.name)
  ) {
    currKeywords.specialties.push(newSpecialty);
  }

  const keywords = {
    specialties: currKeywords.specialties,
    skills: [
      ...skills.filter((s) => !existingKeywords.includes(s.name)),
      ...currKeywords.skills,
    ],
    tools: [
      ...tools.filter((t) => !existingKeywords.includes(t.name)),
      ...currKeywords.tools,
    ],
    industries: [
      ...industries.filter((i) => !existingKeywords.includes(i.name)),
      ...currKeywords.industries,
    ],
  };
  log("specialties", keywords.specialties);
  log("skills", keywords.skills);
  log("tools", keywords.tools);
  log("industries", keywords.industries);

  // call the Orchestrate-Agent
  let response = await orchestrate(summary, keywords);
  msgHistory.add("assistant", response.message.content);

  // logic branches based on the function
  const fxnName = response.message.function_call.name;
  const { explanation } = JSON.parse(response.message.function_call.arguments);
  log("actions", { name: fxnName, explain: explanation });
  await new Promise((r) => setTimeout(r, 1000));

  if (fxnName === "refocus") {
    response = await refocus(msgHistory.pretty());
  } else if (fxnName === "search") {
    let flatKeywords = Object.values(keywords).flat();
    response = await search(flatKeywords, summary);
  } else if (fxnName === "followup") {
    response = await followup(msgHistory.pretty(), keywords);
  } else if (fxnName === "confirm") {
    response = await confirm(msgHistory.pretty(), keywords);
  }
  msgHistory.add("assistant", response.message.content);

  log("agents", "chat: complete.");

  return {
    message: response.message,
    summary,
    keywords,
    action: { name: fxnName, explain: explanation },
  };
}
