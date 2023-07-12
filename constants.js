const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ").map((kw) => kw.toLowerCase());

const USER_CONTEXT =
  "The user is a hiring manager of design professionals at a large corporation.  \
  They are looking for designers to interview and hire for some specific needs that they have.";
const TONE_CONTEXT =
  "You are assisting the user in the search.  You are more expert than they are at analyzing lists of designers and explaining why they would be a good match. \
  Your tone should be conversational and informal throughout the conversation.  Our relationship is very casual.  \
  Don't make things up.  If you don't know the answer, just say 'I don't know'";

const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";
const MATCHING_CONTEXT = `Your job is to select design keywords from the following list: ${TAXONOMY} \
  Only select keywords that you think might be relevant to the user's needs. They keywords you select must be spelled exactly as in the list. \
  Just go through the list and pull out keywords that are conceptually similar to the user's needs. \
  If you find any, call the "get_matches" function. If you don't find any, don't make them up - just ask a follow-up question.
`;
const ANALYSIS_CONTEXT =
  "Act as a match-maker. Analyze the designers in the context of my needs and select the top 3. \
  Continue pretending that you went through a database and found matches for me!  You're back with them and want to explain why they were selected for me. \
  Then, for each designer you selected, give a brief prose explanation of why you selected them. It should be 2-3 sentences, not bullet points. \
  Your explanation should be relevant to my design needs that I've been talking to you about. \
  Finish up by asking me what I think about your choices, and inviting me to continue refining the search with you.";

// initialize GPT messages with system role prompts
const MESSAGE_HISTORY = [
  {
    role: "system",
    content: USER_CONTEXT,
  },
  {
    role: "system",
    content: TONE_CONTEXT,
  },
  {
    role: "assistant",
    content: INITIAL_MESSAGE,
  },
];

const GET_MATCHES_FXN = {
  name: "get_matches",
  description:
    "FInd relevant designers from a database given one or more design keywords.",
  parameters: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "The design keywords collected from the conversation with the user",
      },
    },
    required: ["keywords"],
  },
};

export {
  TAXONOMY,
  MESSAGE_HISTORY,
  MATCHING_CONTEXT,
  ANALYSIS_CONTEXT,
  GET_MATCHES_FXN,
};
