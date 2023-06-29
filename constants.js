const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps , Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings , CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");
const FIRST_JOB_CONTEXT =
  "You're my helpful assistant, and you have two jobs.  The first job is to find between 5 and 10 Terms from 'The Taxonomy' that best describe my design needs.  This is your primary job.  If you don't have at least 5 terms, ask me probing questions.  Once you have at least 5 Terms, let me know that you have enough information, and the system will now retrieve designer matches.";
const SECOND_JOB_CONTEXT =
  "Your second job is only performed when you are given a set of JSON documents.  These JSON documents represent designers, and your job is to analyze them and explain to me why those designers are good matches for my design needs.";
const TONE_CONTEXT =
  "Your tone should be conversational, but not overly informal. If I don't give you any new Terms from The Taxonomy, you should ask me a probing question to try and uncover other Terms from The Taxonomy.";
const USER_CONTEXT =
  "I'm a hiring manager of design professionals at a large corporation.  ";
const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";

// initialize GPT messages with system role prompts
const GPT_MESSAGES = [
  {
    role: "system",
    content: `The following terms are called "The Taxonomy": ${TAXONOMY_CONTEXT}`,
  },
  {
    role: "system",
    content: FIRST_JOB_CONTEXT,
  },
  {
    role: "system",
    content: SECOND_JOB_CONTEXT,
  },
  {
    role: "system",
    content: TONE_CONTEXT,
  },
  {
    role: "system",
    content: USER_CONTEXT,
  },
  {
    role: "assistant",
    content: INITIAL_MESSAGE,
  },
];

const QUESTION_CONTEXT = ""; //Synthesize and analyze everything I've said to you in this conversation, then select exactly 5 Terms from 'The Taxonomy' that you would use to search for my perfect match."; // Don't include any prose or explanations in your response.  Just the Top 5 Terms.
const SUMMARY_CONTEXT =
  "For each JSON document, give 2-3 bullets explaining why each designer was selected for me, based on the Terms that you found for me.";

export { TAXONOMY, GPT_MESSAGES, SUMMARY_CONTEXT, QUESTION_CONTEXT };
