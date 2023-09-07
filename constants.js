const SKILL_MAP = {
  "UX / UI Product Design": [
    "User Personas",
    "User Research",
    "Low-Fidelity Wireframes",
    "Interactive Prototypes",
    "User Journeys",
    "Information Architecture",
    "Interaction Design Specifications",
    "UX & Usability Testing",
    "UX Copywriting",
    "Design Handoff Documentation",
    "UX Design Presentations",
    "UX Rapid Prototyping",
    "Design Systems",
    "Style Guides",
    "Visual Assets",
    "High-Fidelity Wireframes",
    "Accessibility Design",
    "UI Animation",
    "Responsive & Adaptive Design",
    "UI 3D Rendering",
    "Mobile App",
    "Dashboards",
  ],
  "Brand & Marketing Design": [
    "Brand Identity Design",
    "Brand Typography",
    "Copywriting",
    "Email Templates",
    "Websites",
    "Social Media Content",
    "Digital Ad Campaigns",
    "Brand & Marketing Collateral",
    "Environmental Design",
    "Product Packaging",
    "Brand Visual Strategy & Guidelines",
    "Brand Content Strategy & Guidelines",
    "Brand Audit Reports & Presentations",
    "Social Media Visual Strategy",
    "Brand Research",
    "Brand Competition Audit",
  ],
  "Illustration, Graphic & Visual Storytelling": [
    "Layout & Publication Design",
    "Concept Design",
    "Character Design",
    "Industrial Design",
    "Packaging & Label Design ",
    "3D Rendering for Products and Spaces",
    "Data Visualization",
    "Typography & Lettering",
    "Apparel Design",
    "Photo Retouching & Editing",
    "Storyboards",
    "Mixed Media Design",
    "3D Illustration",
    "2D Illustration",
    "Editorial Illustrations",
    "Educational Illustrations",
    "Technical Illustrations",
    "Fashion Illustrations",
  ],
  "Motion, Video & Animation": [
    "2D Animation",
    "2D Motion Graphics",
    "3D Animation",
    "3D Motion Graphics",
    "3D Modeling",
    "Rigging",
    "Stop Motion Animation",
    "Character Development",
    "Animated Banners ",
    "Animated Data Visualization",
    "Social Media Filters",
    "Motion Design",
    "Immersive Technologies",
    "",
    "Video Editing",
    "Video Scripts",
    "Videography",
    "Visual Effects (VFX)",
    "Promotional Videos",
    "Instructional Videos",
  ],
};

const SKILLS =
  "User Personas, User Research, Low-Fidelity Wireframes, Interactive Prototypes, User Journeys, Information Architecture, Interaction Design Specifications, UX & Usability Testing, UX Copywriting, Design Handoff Documentation, UX Design Presentations, UX Rapid Prototyping, Design Systems, Style Guides, Visual Assets, High-Fidelity Wireframes, Accessibility Design, UI Animation, Responsive & Adaptive Design, UI 3D Rendering, Mobile App, Dashboards, Brand Identity Design, Brand Typography, Copywriting, Email Templates, Websites, Social Media Content, Digital Ad Campaigns, Brand & Marketing Collateral, Environmental Design, Product Packaging, Brand Visual Strategy & Guidelines, Brand Content Strategy & Guidelines, Brand Audit Reports & Presentations, Social Media Visual Strategy, Brand Research, Brand Competition Audit , Layout & Publication Design, Concept Design, Character Design, Industrial Design, Packaging & Label Design , 3D Rendering for Products and Spaces, Data Visualization, Typography & Lettering, Apparel Design, Photo Retouching & Editing, Storyboards, Mixed Media Design, 3D Illustration, 2D Illustration, Editorial Illustrations, Educational Illustrations, Technical Illustrations, Fashion Illustrations, 2D Animation, 2D Motion Graphics, 3D Animation, 3D Motion Graphics, 3D Modeling, Rigging, Stop Motion Animation, Character Development, Animated Banners, Animated Data Visualization, Social Media Filters, Motion Design, Immersive Technologies, Video Editing, Video Scripts, Videography, Visual Effects (VFX), Promotional Videos, Instructional Videos";

const TOOLS =
  "3D Studio Max, Abstract, Adobe After Effects, Adobe Animate, Adobe Audition, Adobe Illustrator, Adobe InDesign, Adobe Lightroom, Adobe Photoshop, Adobe Premiere, Adobe Premiere Pro, Adobe Substance Painter, Adobe XD, AutoCAD, Autodesk Flame, Avid, Balsamiq, Blender, Canva, Capture One Pro, Cinema 4D, CSS, CSS 3, DaVinci Resolve, Draw.io, Figma, Final Cut Pro, Framer, Google Docs, Google Slides, HTML, InDesign, InVision, iOS, Keynote, Knockout, Lottie, Marvel, Maya, Microsoft PowerPoint, Microsoft Word, Nuke, Origami Studio, PowerPoint, Principle, Procreate, Proto.io, Sketch, SketchUp, SmartDraw, Spark AR, Tableau, Toonboom, TurboCAD, TV Paint, Unreal Engine, Vray, Webflow, Wordpress, ZBrush, Zeplin";

const INDUSTRIES =
  "Agriculture, Augmented, Virtual and Mixed Reality, Automotive, B2B, Banking and Finance, Beauty, Cannabis, Consumer Electronics, Cryptocurrency, Education, Energy, Fashion, Food and Beverage, Gaming, Government, Health and Fitness, Healthcare, Hotel, Insurance, Legal, Music and Entertainment, Nonprofit, Packaged Goods, Real Estate, Restaurant, Retail, Software, Sports, Startup, Telecommunications, Tobacco, Transportation, Travel and Leisure, Wine, Beer and Spirits";

const SUMMARIZE_CONTEXT = `
  <Instructions>
  You will be given a Chat History between a hiring manager and an AI.
  Your job is to summarize the Chat History as if you were going to provide it to an AI LLM.
  Include all relevant information in the summary, but don't make anything up.
  If you don't know enough to summarize, write "N/A"
  </Instructions>
`;

const SPECIALTY_CONTEXT = `
  <Instructions>
  You will be provided with a list of Design Specialties, and a Chat History between a Hiring Manager and an AI.
  Your job is to select up to two Design Specialties from the list that are highly-relevant to the Hiring Manager's needs.
  Don't select words that are not in the Design Specialties list!  If none of the Design Specialties are relevant, respond with an empty array.

  Step 1 - Select relevant Design Specialties.  They must be spelled EXACTLY as in the list.
  Step 2 - For each selected Design Specialty, write a one-sentence explanation of why you selected it.
  Step 3 - Provide your answer as JSON in the following format: {"specialties": [{"name": <SPECIALTY_NAME>, "explain": <SELECTION_EXPLANATION>}, ...]}
  </Instructions>
`;

const PARSE_CONTEXT = `
  <Instructions>
  You will be provided with a Keyword List, and a Chat History between a Hiring Manager and an AI.
  Your job is to select keywords from the Keyword List that are relevant to the Hiring Manager's needs in the Chat History.
  If no keywords in the Keyword List are relevant, don't make any up!!  Simply respond with an empty array.
  
  Step 1 - Select keywords from the Keyword List.  They MUST be spelled EXACTLY as in the Keyword List.
  Step 2 - For each selected keyword, write a one-sentence explanation of why you selected it.
  Step 3 - Provide your answer as JSON in the following format: {"keywords": [{"name": <KEYWORD_NAME>, "explain": <SELECTION_EXPLANATION>}, ...]}
  </Instructions>
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

  You know they are trying to hire a Creative professional for a position they have open.
  In order to match them with your team of Creatives, you need to know more from the Hiring Manager.

  You can assume the Hiring Manager wants a senior-level Creative who is available immediately.
  Everyone on your team meets those requirements. But you need more information to make a high-quality match.
`;

const FOLLOWUP_EXAMPLES = `
  Example 1:
  Absolutely, we have folks that can help.  Can you provide some more context on what this is for?
  
  Example 2:
  Got it - what kind of motion work are you looking for?  Are you looking to bring life to static assets - like a title sequence movie a 2 minute explainer video?

  Example 3:
  OK, I can already think of a few Creatives who might be a good fit.  Is this pitch work? Or are you looking for stuff that will live in an informational brochure?

  Example 4:
  Do you imagine this person as a bespoke craftsman who makes things from scratch?  Someone who can make things really look good, you just tell them an idea and they bring it to life.

  Example 5:
  Let me know if this sounds right: you need someone who can work really well within your guidelines and truly understand your brand.  Someone who is highly skilled at the nuance and details of brand, understands color palettes and typography, and understands the brand and how things live within it.

  Example 6:
  What type of creative personality are you looking for?  An Individual Contributor who needs minimal direction - you can give them an idea and they run with it, works really well async?  Or someone that's Highly Collaborative: embedded in your team and prefers real-time communication throughout the day?

  Example 7:
  Got it, OK I think I have everything I need.  Anything else that we missed before I send matches?
`;

const REFOCUS_CONTEXT = `
  You will be given a summary of a conversation between a Hiring Manager and an AI.
  Your job is to steer the conversation to the topic of hiring creative professionals.
`;

const SEEN_CREATIVES = new Set();

const GPT_FUNCTIONS = [
  // {
  //   name: "get_creative_matches",
  //   description:
  //     "Finds relevant Creatives from a database given an array of at least three tags.  The more tags that are supplied, the more relevant the results.",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       tags: {
  //         type: "array",
  //         items: {
  //           type: "string",
  //         },
  //         description:
  //           "A set of design-related tags collected from the conversation with the user.  At least three tags are required.",
  //       },
  //     },
  //     required: ["tags"],
  //   },
  // },
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
  SKILLS,
  SKILL_MAP,
  TOOLS,
  INDUSTRIES,
  INITIAL_MESSAGE,
  SUMMARIZE_CONTEXT,
  SPECIALTY_CONTEXT,
  PARSE_CONTEXT,
  ORCHESTRATE_CONTEXT,
  FOLLOWUP_CONTEXT,
  FOLLOWUP_EXAMPLES,
  EXPLAIN_CONTEXT,
  REFOCUS_CONTEXT,
  GPT_FUNCTIONS,
  SEEN_CREATIVES,
};
