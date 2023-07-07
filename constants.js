const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");
const USER_CONTEXT =
  "I'm a hiring manager of design professionals at a large corporation.  I'm trying to find a designer to interview and hire for some specific needs that I have.";
const JOB_CONTEXT =
  "You are assisting me in the search.  You are more expert than I at analyzing and explaining design information.";
const TONE_CONTEXT =
  "Your tone should be conversational and informal throughout the conversation.  Our relationship is very casual.  \
  Don't make things up.  If you don't know the answer, just say 'I don't know'";
const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";
const QUESTION_CONTEXT =
  "Act as a match-maker.  First, go through everything I've told you, and distill all of my needs into around 5 keywords.  They must come from the list that you have of design keywords. \
  Often, you won't have enough information for any keywords to apply.  In that case, don't make one up - just ask me a followup question. \
  Once you're certain that at least one keyword applies, let me know you have enough information now, and pretend to go look through your database for designers for me.  Let me know it might take a minute, but you'll be right back.";
const ANALYSIS_CONTEXT =
  "Act as a match-maker. Analyze the designers in the context of my needs and select the top 3. \
  Continue pretending that you went through a database and found matches for me!  You're back with them and want to explain why they were selected for me. \
  Then, for each designer you selected, give a brief prose explanation of why you selected them. It should be relevant to my design needs that I've been talking to you about. \
  Finish up by asking me what I think about your choices, and inviting me to continue refining the search with you.";

// initialize GPT messages with system role prompts
const GPT_MESSAGES = [
  {
    role: "system",
    content: USER_CONTEXT,
  },
  {
    role: "system",
    content: JOB_CONTEXT,
  },
  {
    role: "system",
    content: `This is a list of design keywords.  Whenever you are asked for design keywords, you should only choose keywords from this list: ${TAXONOMY_CONTEXT}.`,
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
    "Find relevant designers from a database given one or more design keywords.",
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
  GPT_MESSAGES,
  ANALYSIS_CONTEXT,
  QUESTION_CONTEXT,
  GET_MATCHES_FXN,
};
