export const SKILL_MAP = {
  "UX/UI Product Design": [
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
    "Video Editing",
    "Video Scripts",
    "Videography",
    "Visual Effects (VFX)",
    "Promotional Videos",
    "Instructional Videos",
  ],
};

export const TOOLS = [
  "Adobe XD",
  "Figma",
  "Sketch",
  "InVision",
  "Marvel",
  "Proto.io",
  "ProtoPie",
  "Principle",
  "Zeplin",
  "Origami Studio",
  "Framer",
  "Balsamiq",
  "Draw.io",
  "Webflow",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Adobe InDesign",
  "Canva",
  "Google Slides",
  "Keynote",
  "Microsoft PowerPoint",
  "Microsoft Word",
  "Google Docs",
  "Wordpress",
  "SmartDraw",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Procreate",
  "ZBrush",
  "Adobe Substance Painter",
  "Keyshot",
  "Rhino 3D",
  "Solidworks",
  "Autodesk Fusion 360",
  "SketchUp",
  "3D Studio Max",
  "Cinema 4D",
  "Blender",
  "Maya",
  "Grasshopper",
  "Adobe After Effects",
  "Adobe Animate",
  "Adobe Premiere",
  "Adobe Audition",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Autodesk Flame",
  "Avid",
  "Nuke",
  "Toonboom",
  "TV Paint",
  "Unreal Engine",
  "Vray",
  "Spark AR",
  "Lottie",
];

export const INDUSTRIES = [
  "Agriculture",
  "Augmented, Virtual and Mixed Reality",
  "Automotive",
  "B2B",
  "Banking and Finance",
  "Beauty",
  "Cannabis",
  "Consumer Electronics",
  "Cryptocurrency",
  "Education",
  "Energy",
  "Fashion",
  "Food and Beverage",
  "Gaming",
  "Government",
  "Health and Fitness",
  "Healthcare",
  "Hotel",
  "Insurance",
  "Legal",
  "Music and Entertainment",
  "Nonprofit",
  "Packaged Goods",
  "Real Estate",
  "Restaurant",
  "Retail",
  "Software",
  "Sports",
  "Startup",
  "Telecommunications",
  "Tobacco",
  "Transportation",
  "Travel and Leisure",
  "Wine, Beer and Spirits",
];

export function pprint(keywords) {
  // convert keyword objects into array of names
  const specialties = keywords.specialties
    .map((s) => `<Specialty>${s.name}</Specialty>`)
    .join("\n");
  const skills = keywords.skills
    .map((s) => `<Skill>${s.name}</Skill>`)
    .join("\n");
  const tools = keywords.tools.map((t) => `<Tool>${t.name}</Tool>`).join("\n");
  const industries = keywords.industries
    .map((i) => `<Industry>${i.name}</Industry>`)
    .join("\n");

  return {
    specialties,
    skills,
    tools,
    industries,
  };
}

export function isKeyword(keywordName) {
  const allKeywords = [
    ...Object.keys(SKILL_MAP),
    ...Object.values(SKILL_MAP).flat(),
    ...TOOLS,
    ...INDUSTRIES,
  ];

  return !!allKeywords.includes(keywordName);
}

export function unflatten(keywords) {
  const unflattened = {
    skills: keywords.filter((kw) =>
      Object.values(SKILL_MAP).flat().includes(kw.name)
    ),

    tools: keywords.filter((kw) => TOOLS.includes(kw.name)),
    industries: keywords.filter((kw) => INDUSTRIES.includes(kw.name)),
  };

  return unflattened;
}
