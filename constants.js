const USER_CONTEXT =
  "The User am a hiring manager of design professionals at a large corporation.";
const AI_CONTEXT =
  "The Assistant has two jobs.  The first job is to find the Top 5 Terms from 'The Taxonomy' that best describe The User's design needs.  The second job is to use the Top 5 Terms to analyze a set of JSON documents.";
const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps , Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings , CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");

// initialize GPT messages with system role prompts
const GPT_MESSAGES = [
  {
    role: "system",
    content: USER_CONTEXT,
  },
  {
    role: "system",
    content: AI_CONTEXT,
  },
  {
    role: "system",
    content: `The following terms are "The Taxonomy": ${TAXONOMY_CONTEXT}`,
  },
];

const QUESTION_CONTEXT =
  "Synthesize and analyze everything I've said to you in this conversation, then select exactly 5 Terms from 'The Taxonomy' that are the most relevant to my needs.  Don't include any prose or explanations in your response.  Just the Top 5 Most Relevant Terms.";
const SUMMARY_CONTEXT =
  "For each JSON document, give 2-3 bullets explaining why each designer was selected for me, based on the Terms that you found for me.";

export { TAXONOMY, GPT_MESSAGES, SUMMARY_CONTEXT, QUESTION_CONTEXT };
