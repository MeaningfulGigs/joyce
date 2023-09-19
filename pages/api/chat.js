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
  log("agents", "chat: parsing...");

  // add user input to message history
  msgHistory.add("user", userInput);

  // generate a summary of the current chat history
  const summary = await summarize(msgHistory.pretty());
  log("summary", summary);

  // new specialties are added to existing ones, but capped at 2
  let newKeywords;
  if (currKeywords.specialties.length < 2) {
    newKeywords = await Promise.all([
      parseSpecialty(summary),
      parse(summary, "tools"),
      parse(summary, "industries"),
    ]);
    const [specialty, ...rest] = newKeywords;
    let specialties = [...new Set([specialty, ...currKeywords.specialties])];
    const skills = await parse(summary, "skills", specialties);
    newKeywords = [specialties, skills, ...rest];
  } else if (currKeywords.specialties.length === 2) {
    newKeywords = await Promise.all([
      Promise.resolve(currKeywords.specialties),
      parse(summary, "skills", currKeywords.specialties),
      parse(summary, "tools"),
      parse(summary, "industries"),
    ]);
  }

  const [specialties, skills, tools, industries] = newKeywords;
  log("agents", "chat: complete.");

  // call the Orchestrate-Agent
  const keywords = {
    specialties: [...new Set([...specialties, ...currKeywords.specialties])],
    skills: [...new Set([...skills, ...currKeywords.skills])],
    tools: [...new Set([...tools, ...currKeywords.tools])],
    industries: [...new Set([...industries, ...currKeywords.industries])],
  };
  log("specialties", keywords.specialties);
  log("skills", keywords.skills);
  log("tools", keywords.tools);
  log("industries", keywords.specialties);

  let response = await orchestrate(summary, keywords);

  // logic branches based on the function
  const fxnName = response.message.function_call.name;
  const { explanation } = JSON.parse(response.message.function_call.arguments);
  msgHistory.add("assistant", response.message.content);
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
