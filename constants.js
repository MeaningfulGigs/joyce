const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design, Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");

const SUMMARIZE_CONTEXT = `
  You will be given a Chat History between a hiring manager and an AI.
  Your job is to summarize the Chat History from the point-of-view of the hiring manager.

  Your summary should be up to a paragraph in length, and should be written as though you are the Hiring Manager.
  You should use the first-person ("I need a designer who can...") and only use information from the Chat History.
  Don't make anything up. If you don't know enough to summarize, write "N/A"
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
  Your job is to call the function that takes the best action given the conversation so far.
  
  You MUST ALWAYS call one of the functions that you have been provided.
`;

const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";

const EXPLAIN_CONTEXT = `
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

const FOLLOWUP_CONTEXT = `
  You will be given a summary of a conversation between a Hiring Manager and an AI.
  Your job is to collect more information about the needs of the Hiring Manager.

  You know they are trying to hire a Creative professional for a position they nave open.
  In order to match them with your team of Creatives, you need to know more from the Hiring Manager.
  For instance, you can ask about specific skills, tools, or industries that they are interested in.

  You can assume the Hiring Manager wants a senior-level Creative who is available immediately.
  Everyone on your team meets those requirements. But you need more information to make a high-quality match.
`;

const REFOCUS_CONTEXT = `
  You will be given a summary of a conversation between a Hiring Manager and an AI.
  The conversation has gotten off the topic of hiring creative professionals.
  Your job is to bring the conversation back to that topic.
`;

const SEEN_CREATIVES = new Set();

const GPT_FUNCTIONS = [
  {
    name: "get_creative_matches",
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
    name: "get_creative_detail",
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
    name: "ask_followup",
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
  FOLLOWUP_CONTEXT,
  EXPLAIN_CONTEXT,
  REFOCUS_CONTEXT,
  GPT_FUNCTIONS,
  SEEN_CREATIVES,
};
