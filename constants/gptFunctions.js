export const GPT_FUNCTIONS = [
  {
    name: "followup",
    description:
      "This function asks a follow-up question about the User's design needs.  You must call this function before calling `confirm_search",
    parameters: {
      type: "object",
      properties: {
        explanation: {
          type: "string",
          description: "An explanation of why this function was selected.",
        },
      },
    },
  },
  {
    name: "confirm_search",
    description:
      "This function confirms with the User that the collected information is accurate.  It can only be called if the `followup` function has already been called.  You must call this function before calling `search`",
    parameters: {
      type: "object",
      properties: {
        explanation: {
          type: "string",
          description: "An explanation of why this function was selected.",
        },
      },
    },
  },
  {
    name: "search",
    description:
      "This function searches a database and retrieves relevant Creative professionals.  It can only be called if the `confirm_search` function has already been called",
    parameters: {
      type: "object",
      properties: {
        specialties: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The Specialties Keywords that you have been provided.",
        },
        skills: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The Skills Keywords that you have been provided.",
        },
        tools: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The Tools Keywords that you have been provided.",
        },
        industries: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The Industries Keywords that you have been provided.",
        },
        explanation: {
          type: "string",
          description: "An explanation of why this function was selected.",
        },
      },
      required: ["specialties, skills, explanation"],
    },
  },
  {
    name: "get_creative_detail",
    description:
      "Finds a specific Creative from a database given the name of the Creative. Then provides a custom profile for the Creative based on the user's needs.",
    parameters: {
      type: "object",
      properties: {
        creativeName: {
          type: "string",
          description:
            "The name of the Creative professional to look up in the database",
        },
      },
      required: ["creativeName"],
    },
  },
  {
    name: "refocus_conversation",
    description:
      "Refocuses the conversation back to hiring a Creative professional. This function should be called if the user is talking about things other than hiring Creative professionals.",
    parameters: {
      type: "object",
      properties: {
        explanation: {
          type: "string",
          description: "An explanation of why this function was selected.",
        },
      },
    },
  },
];
