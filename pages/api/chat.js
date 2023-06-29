const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const USER_CONTEXT =
  "The User am a hiring manager of design professionals at a large corporation.";
const AI_CONTEXT =
  "The Assistant's job is to find Terms from 'The Taxonomy' that best describe The User's design needs.";
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
  "Combine all of the requirements I've given you in this conversation. Which Terms from 'The Taxonomy' would you use to describe all my needs?  You should include any previous Terms you've given me.";
const SUMMARY_CONTEXT =
  "For each JSON document, give 2-3 bullets explaining why each designer was selected for me, based on the Terms that you found for me.  Start the response off with an introductory prose sentence.";

export async function getKeywords(userInput) {
  GPT_MESSAGES.push({
    role: "user",
    content: `${userInput}. ${QUESTION_CONTEXT}`,
  });
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
  });

  let gptMessage = response.data.choices[0].message;

  // include GPT response in chat history
  GPT_MESSAGES.push({
    role: "assistant",
    content: gptMessage.content,
  });

  // parse taxonomy keywords from GPT response
  const keywords = TAXONOMY.map((term) => {
    if (
      gptMessage.content.includes(term) ||
      gptMessage.content.includes(term.toLowerCase())
    ) {
      return term;
    }
  })
    .filter(Boolean)
    .map((kw) => ["st", kw]);

  return {
    content: gptMessage.content,
    keywords,
  };
}

export async function getMatches(keywords) {
  const params = new URLSearchParams(keywords);
  const searchUrl = `https://search-dev.meaningfulgigs.com?${params}`;
  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RIVERA_TOKEN}`,
    },
  });

  const matches = await response.json();

  return matches.slice(0, 3);
}

export async function getSummary(matches) {
  const matches_context = [
    {
      role: "assistant",
      content:
        "The following JSON documents are profiles of different designers that were found to be similar to your needs.",
    },
    {
      role: "assistant",
      content: JSON.stringify(matches),
    },
    {
      role: "user",
      content: SUMMARY_CONTEXT,
    },
  ];
  GPT_MESSAGES.push(...matches_context);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: GPT_MESSAGES,
  });

  if (response.status !== 200) {
    handleError();
    return;
  }

  const gptMessage = response.data.choices[0].message;
  GPT_MESSAGES.push({
    role: "assistant",
    content: gptMessage.content,
  });

  return gptMessage.content;
}
