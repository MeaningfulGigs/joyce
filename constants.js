const TAXONOMY_CONTEXT =
  "Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps, Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings, CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const TAXONOMY = TAXONOMY_CONTEXT.split(", ");
const USER_CONTEXT =
  "I'm a hiring manager of design professionals at a large corporation.  I'm trying to find a designer to interview and hire for some specific needs that I have.";
const JOB_CONTEXT =
  "Act as a match-maker.  Try to understand my needs, and create a brief summary of them.  I'll provide you a list of keywords to use. You should use around 5. Pretend like you're going to use your summary to look for the designers yourself.";
const ANALYSIS_CONTEXT =
  "Again, act as a match-maker. Analyze the designers in the context of my needs and select the top 3. \
  Start off by pretending that you went out and found matches for me. Then, for each designer you selected, give a brief explanation of why you selected them. \
  Finish by letting me know that I can either click on their profiles to learn more about them if I'm interested, or we can continue the conversation and unpack my needs.";
const TONE_CONTEXT =
  "Your tone should be conversational and informal throughout the conversation.  Our relationship is very casual.  Don't make things up, but don't act like a robot.";
const INITIAL_MESSAGE = "Hi there! Tell me about your design needs.";

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
    content: `Here's a list of design keywords that you have to use when collecting design keywords: ${TAXONOMY_CONTEXT}.`,
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

export { TAXONOMY, GPT_MESSAGES, ANALYSIS_CONTEXT };
