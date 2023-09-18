import { ORCHESTRATE_CONTEXT, INITIAL_MESSAGE } from "../../constants/contexts";

// initialize GPT messages
export default class MessageHistory {
  constructor() {
    this.messages = [
      {
        role: "system",
        content: ORCHESTRATE_CONTEXT,
      },
      {
        role: "assistant",
        content: INITIAL_MESSAGE,
      },
    ];
  }

  get history() {
    return this.messages;
  }

  get chat() {
    const history = this.messages.filter(
      (message) => message.role === "user" || message.role === "assistant"
    );

    return history;
  }

  add(role, content, functionName) {
    this.messages.push({
      role,
      content,
      name: functionName,
    });

    return this.messages;
  }

  pretty() {
    const history = this.messages.filter(
      (message) => message.role !== "system"
    );
    return `${history
      .map((m) => {
        let message;
        if (m.role === "system") {
          message = `
            **************************************************
            ${m.content}
            **************************************************
        `;
        } else if (m.role === "user") {
          message = `Hiring Manager:  ${m.content}`;
        } else if (m.role === "assistant") {
          message = `AI:  ${m.content}`;
        } else if (m.role === "function") {
          message = `
            API Response:
            ${m.content}
        `;
        } else {
          return;
        }

        return `${message}`;
      })
      .join("\n")}`;
  }
}
