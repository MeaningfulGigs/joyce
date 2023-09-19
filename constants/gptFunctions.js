export const GPT_FUNCTIONS = [
  {
    name: "refocus",
    description:
      "Call this function if you have been provided 0 Specialty keywords.",
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
    name: "followup",
    description:
      "Call this function if you have been provided 1-2 Specialty keywords, but fewer than 3 Skill keywords.",
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
    name: "confirm",
    description:
      "Call this function if you have been providfed 1-2 Specialty keywords, and 3 or more Skill keywords.",
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
      "Call this function if the `confirm` function has already been called, and you don't have any further questions.",
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
];
