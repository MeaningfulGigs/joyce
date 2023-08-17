const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design, Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");

const SUMMARIZE_CONTEXT = `
  You will receive a chat history between a Hiring Manager and an AI.
  Your task is to provide TWO summaries of the chat history.

  The only difference between the two summaries is the length.
  One must be 8 words or fewer ("topic"). The other should be about a paragraph ("description").
  If there's not enough information, respond with "N/A" instead of making up facts.

  Provide your answer as JSON in the following format:
  {"topic": {topic}, "description": {description}}
`;

const PARSE_CONTEXT = `
  You will be presented with a conversation between a user and an AI.
  Your job is to provide a set of relevant tags from a list you are given.

  There are two rules you MUST follow when choosing the tags:
  (1) They MUST come from this list and spelled identically: ${TAXONOMY_CONTEXT}
  (2) They MUST be relevant to the needs of the user in the conversation

  Provide your answer as JSON in the following format:
  {"keywords": [{tag1}, {tag2}, ...]}
`;

const SYSTEM_CONTEXT = `
  The user is a hiring manager at a large corporation.
  They need to find remote creative professionals that match their specific needs.
  Their goal is to interview several, and ultimately hire one.
  
  You are assisting the user in the search. Your tone should be casual and conversational, but helpful.
  Ask questions about the skills and experience they're looking for.

  Internally, break down the user's design needs into tags - specifically, tags for skills, tools, and industries.
  These are secret and shouldn't be discussed or shared with the user.  Never talk about the tags in your response!!

  Once you have enough tags to make a match, don't ask any more follow-up questions.
  Instead, ask the user to hold on while you search for available Creatives, and call the supplied 'match' function.
`;

const ORCHESTRATE_CONTEXT = `
  You will be given a summary of a conversation between a Hiring Manager and an AI. You have to decide what to do next.
  You will be given a set of functions that represent the different actions you can take.
  Your job is to select the function that takes the best next action given the conversation so far, and explain your selection.

  RULES:
  - You should always call exactly one function from the set you are given
  - You should always provide a 1-2 sentence prose response detailing exactly why you selected that specific function
`;

const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";

const EXPLAIN_CONTEXT =
  "Instructions:\n\
  - You will be given the profiles of Creative professionals who are candidates for a job opening.\n\
  - You will also be given a summary of the job requirements for an opening that the user, a hiring manager, is trying to fill.\n\
  - Pretend that you personally selected the three Creatives for the user. Your job is to explain why each Creative is a good match.\n\
  - Use the information you're given about each Creative to specifically connect them with the job requirements.\n\
  - Use projects and skills to create a compelling explanation, especially mentioning any experience with companies that are well-known.\n\
  Formatting:\n\
  - Your response should be numbered for each Creative.  Use 2-3 sentences, and only use prose: no bullet points.\n\
  - Use markdown to format your response.  The Creative names should be **bold**, and any info about the Creative that is aligned with the hiring manager's needs should be *italicized*\n\
  - After the explanations, finish by asking for the hiring manager's thoughts.\n\
  - Throughout, you should be casual. You're an expert, but you're also the hiring manager's friend.  But not overly informal: this is still a conversation in the professional context.";

const SEEN_CREATIVES = new Set();

const GPT_FUNCTIONS = [
  {
    name: "match",
    description:
      "Finds relevant Creatives from a database given an array of at least three tags.  The more tags that are supplied, the more relevant the results.",
    parameters: {
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "A set of design-related tags collected from the conversation with the user.  At least three tags are required.",
        },
      },
      required: ["tags"],
    },
  },
  {
    name: "get_creative",
    description:
      "Finds a specific Creative professional from a database and provides a custom profile for them based on the user's needs.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "The name of the Creative professional to look up in the database",
        },
        focusAreas: {
          type: "array",
          items: {
            type: "string",
            enum: ["skills", "industries", "tools"],
          },
          description:
            "If provided, focus areas specify an area to go into greater detail when generating the profile.",
        },
      },
      required: ["creativeName"],
    },
  },
  {
    name: "follow_up",
    description:
      "Asks a follow-up question to the user in order to collect more information about the user's design needs.  This function should be called when there are not enough tags to call `match`.",
    parameters: {
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "If provided, tags specify the keywords that have already been collected from the conversation with the user.",
        },
      },
    },
  },
  {
    name: "refocus",
    description:
      "Refocuses the conversation back to hiring a Creative professional. This function should be called if the user is talking about things other than hiring Creative professionals.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

export {
  TAXONOMY,
  INITIAL_MESSAGE,
  SUMMARIZE_CONTEXT,
  PARSE_CONTEXT,
  ORCHESTRATE_CONTEXT,
  EXPLAIN_CONTEXT,
  GPT_FUNCTIONS,
  SEEN_CREATIVES,
};
