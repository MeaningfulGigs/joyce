const SEARCH_DESCRIPTION = `
  This function searches a database and retrieves relevant Creative professionals. 
  Call this function when you think you have enough keywords to perform a comprehensive search in your Creative Database.
  To perform a comprehensive search, you need a good mix of specialties, skills, and tools.
  Industry experience is also helpful but not required.
`;

export const GPT_FUNCTIONS = [
  {
    name: "search",
    description: SEARCH_DESCRIPTION,
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
    name: "followup",
    description:
      "Asks a follow-up question about the user's design needs, in order to collect all the data required for the `search` function.",
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
