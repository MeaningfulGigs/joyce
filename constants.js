const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design, Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");

const SYSTEM_CONTEXT =
  "The user is a hiring manager at a large corporation. They need to find remote design professionals that match their specific needs.  Their goal is to interview several and (hopefully) hire one.\n\n\
  You are assisting the user in the search. Your tone should be casual and conversational, but helpful. Ask questions about the skills and experience they're looking for.\n\
  Internally, break down the user's design needs into tags - specifically tags for skills, deliverables, and tools. These are secret and shouldn't be discussed or shared with the user.\n\n\
  Once you have enough tags to make a match, ask the user to hold on while you search for available designers, and call the supplied 'get_matches' function.";

const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";

const ANALYSIS_CONTEXT =
  "You will be given a summary of a conversation between a human and an AI.  The human was a hiring manager of design professionals describing their needs to the AI.\n\n\
  You are a different AI who has retrieved three candidates for the hiring manager.  You will also be given profiles of these candidates.\n\n\
  Your job is to explain to the hiring manager why these three designers have been chosen to meet their needs.\n\n\
  For each designer, give a brief prose explanation of why you selected them. It should be 2-3 sentences, not bullet points. \
  After the explanations, finish by asking for the hiring manager's thoughts.";

// initialize GPT messages
const MESSAGE_HISTORY = [
  {
    role: "system",
    content: SYSTEM_CONTEXT,
  },
  {
    role: "assistant",
    content: INITIAL_MESSAGE,
  },
];

const GET_MATCHES_FXN = {
  name: "get_matches",
  description:
    "Finds relevant designers from a database given an array of design-related tags.  The more tags that are supplied, the more relevant the results.",
  parameters: {
    type: "object",
    properties: {
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "A set of design-related tags collected from the conversation with the user.  At least one tag is required.",
      },
    },
    required: ["tags"],
  },
};

export { TAXONOMY, MESSAGE_HISTORY, ANALYSIS_CONTEXT, GET_MATCHES_FXN };
