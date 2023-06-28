import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const USER_CONTEXT =
  "I am a hiring manager of design professionals at Starbucks.";
const AI_CONTEXT =
  "Your job is to find terms from The Taxonomy that answer my question.";
const TAXONOMY_CONTEXT =
  "The following terms are The Taxonomy: Visual Website Design, Visual App Design, Product Design, Dashboards, Sitemaps , Prototypes, Prototyping, User Research, Personas, User Journeys, User Flows, Wireframes, 3D UI Renderings , CAD Drawings, UI/UX Design Systems, Migration, Landing Pages, Web & App Integrations, Web & App Reskin, E-commerce, UI/UX Copywriting, UI Design, UX Design, Web Design, Usability Testing, Information Architecture, Mobile UI, Mobile UX, Responsive Design, High Fidelity Wireframes, 3D Design, Web UI, Visual Identity, Naming, Brand Guidelines, Package Design, Label Design, Typography, Event Design, Customer Experiences, Point of Purchase, Marketing Collateral, Concepting, Art Direction, Social Media Campaigns, Social Content, Digital Content, Copywriting, Storytelling, Brand Strategy, Social Media Strategy, Content Calendar, Banner Ads, Brand Design, Creative Direction, Ad Campaigns, Creative Strategy, Photo Retouching, Video Scripts, Signage, Newsletters, Flyers, Vehicle Wraps, Email Templates, Corporate Identity Design, Brand Collateral, Brand Design Systems, Illustration, Deck Design   , Presentation Design, Instruction Manuals, 2D Illustration, 3D Illustration, Portraits, Character Design, Posters, Mural, Infographics, Graphics, Lettering, Icons, Print Design, Editorial Design, Layout Design, Report Design, Logo Design, Graphic Design, Concept Art, Visual Development Art, Comic Books, Storyboards, Book Design, Magazine Design, Newspaper Design, Catalog Design, Leaflet Design, Brochure Design, Cover Design, E-book Design, Annual Report Design, Character Development , Postcard Design, PowerPoint Design, Menu Design, Stationary Design, 2D Motion Graphics, 3D Motion Graphics, Animation, Video Editing, VFX, Data Visualization, Animated Character Development, 3D Modeling, 3D Rendering, 3D Animation, 2D Animation, Social Media Filters, Motion Design, GIFs";
const RESPONSE_CONTEXT =
  "The response must be RFC-8259 compliant JSON with the following form:\
  { 'terms': <SELECTED TAXONOMY TERMS> } \
  For the key 'terms', the value may only contain terms from The Taxonomy \
  If the question cannot be answered using the information provided, don't make things up - just answer with 'I don't know'.";
const QUESTION_CONTEXT =
  "Which terms from The Taxonomy would you use to describe my needs?";
const GPT_MESSAGES = [
  {
    role: "system",
    content: USER_CONTEXT,
  },
  {
    role: "assistant",
    content: AI_CONTEXT,
  },
  {
    role: "system",
    content: TAXONOMY_CONTEXT,
  },
  {
    role: "system",
    content: RESPONSE_CONTEXT,
  },
];
const TAXONOMY = [
  "Visual Website Design",
  "Visual App Design",
  "Product Design",
  "Dashboards",
  "Sitemaps ",
  "Prototypes",
  "Prototyping",
  "User Research",
  "Personas",
  "User Journeys",
  "User Flows",
  "Wireframes",
  "3D UI Renderings ",
  "CAD Drawings",
  "UI/UX Design Systems",
  "Migration",
  "Landing Pages",
  "Web & App Integrations",
  "Web & App Reskin",
  "E-commerce",
  "UI/UX Copywriting",
  "UI Design",
  "UX Design",
  "Web Design",
  "Usability Testing",
  "Information Architecture",
  "Mobile UI",
  "Mobile UX",
  "Responsive Design",
  "High Fidelity Wireframes",
  "3D Design",
  "Web UI",
  "Visual Identity",
  "Naming",
  "Brand Guidelines",
  "Package Design",
  "Label Design",
  "Typography",
  "Event Design",
  "Customer Experiences",
  "Point of Purchase",
  "Marketing Collateral",
  "Concepting",
  "Art Direction",
  "Social Media Campaigns",
  "Social Content",
  "Digital Content",
  "Copywriting",
  "Storytelling",
  "Brand Strategy",
  "Social Media Strategy",
  "Content Calendar",
  "Banner Ads",
  "Brand Design",
  "Creative Direction",
  "Ad Campaigns",
  "Creative Strategy",
  "Photo Retouching",
  "Video Scripts",
  "Signage",
  "Newsletters",
  "Flyers",
  "Vehicle Wraps",
  "Email Templates",
  "Corporate Identity Design",
  "Brand Collateral",
  "Brand Design Systems",
  "Illustration",
  "Deck Design   ",
  "Presentation Design",
  "Instruction Manuals",
  "2D Illustration",
  "3D Illustration",
  "Portraits",
  "Character Design",
  "Posters",
  "Mural",
  "Infographics",
  "Graphics",
  "Lettering",
  "Icons",
  "Print Design",
  "Editorial Design",
  "Layout Design",
  "Report Design",
  "Logo Design",
  "Graphic Design",
  "Concept Art",
  "Visual Development Art",
  "Comic Books",
  "Storyboards",
  "Book Design",
  "Magazine Design",
  "Newspaper Design",
  "Catalog Design",
  "Leaflet Design",
  "Brochure Design",
  "Cover Design",
  "E-book Design",
  "Annual Report Design",
  "Character Development ",
  "Postcard Design",
  "PowerPoint Design",
  "Menu Design",
  "Stationary Design",
  "2D Motion Graphics",
  "3D Motion Graphics",
  "Animation",
  "Video Editing",
  "VFX",
  "Data Visualization",
  "Animated Character Development",
  "3D Modeling",
  "3D Rendering",
  "3D Animation",
  "2D Animation",
  "Social Media Filters",
  "Motion Design",
  "GIFs",
];

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatives, setCreatives] = useState(null);
  const [messages, setMessages] = useState([
    {
      message: "Hi there! Tell me about your design needs.",
      type: "apiMessage",
    },
  ]);

  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);
  const creativesRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  // Handle errors
  const handleError = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: "Oops! There seems to be an error. Please try again.",
        type: "apiMessage",
      },
    ]);
    setLoading(false);
    setUserInput("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput.trim() === "") {
      return;
    }

    setLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: userInput, type: "userMessage" },
    ]);

    // Format user input for GPT API and add to history
    GPT_MESSAGES.push({
      role: "user",
      content: `${userInput}. ${QUESTION_CONTEXT}`,
    });
    let response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: GPT_MESSAGES,
    });

    if (response.status !== 200) {
      handleError();
      return;
    }

    // Reset user input
    setUserInput("");

    let gptMessage = response.data.choices[0].message;

    // parse taxonomy keywords from GPT response
    const params = TAXONOMY.map((term) => {
      if (
        gptMessage.content.includes(term) ||
        gptMessage.content.includes(term.toLowerCase())
      ) {
        return term;
      }
    })
      .filter(Boolean)
      .map((kw) => ["st", kw]);
    console.log(params);
    const q = new URLSearchParams(params);
    const searchUrl = `https://search-dev.meaningfulgigs.com?${q}`;
    response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJzaG93Y2FzZSIsInVzZXJJRCI6IjY0OTkzNjk3ZmUxOGI2MTEzMDcyZGNmYSIsInR5cGUiOiJjbGllbnQiLCJuYW1lIjoiTWF4IFQuIiwiaXNPbmJvYXJkaW5nQ29tcGxldGUiOmZhbHNlLCJlbWFpbCI6Im1heCt0ZXN0QG1lYW5pbmdmdWxnaWdzLmNvbSIsImNvbXBhbnkiOiJNZWFuaW5nZnVsIEdpZ3MiLCJlbnRlcnByaXNlTG9nbyI6ImRvbWFpbnMvNjM0ODQ3MjE1MzQ0M2Q3NGZkNDYxODRlL2xvZ28ucG5nIiwiaGFzR2lncyI6ZmFsc2UsImlhdCI6MTY4Nzc2MjU4MywiZXhwIjoxNjkwMzU0NTgzLCJpc3MiOiJtZWFuaW5nZnVsZ2lncy5jb20iLCJzdWIiOiJNR1VzZXIiLCJqdGkiOiJ2MS4wLjIifQ.T4yQGaJjgBKLZ9W2hKl6YG-N1YvNfPgyQP2KqWaIUrs",
      },
    });

    let matches = await response.json();
    matches = matches.slice(0, 3);
    setCreatives(matches);
    const MATCHES_CONTEXT = [
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
        content:
          "For each JSON document, give 2-3 bullets explaining why each designer was selected for me.  Start off with a sentence telling me you're explaining my results.",
      },
    ];

    GPT_MESSAGES.push(...MATCHES_CONTEXT);

    response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: GPT_MESSAGES,
    });

    if (response.status !== 200) {
      handleError();
      return;
    }

    gptMessage = response.data.choices[0].message;

    setMessages((prevMessages) => [
      ...prevMessages,
      { message: gptMessage.content, type: "apiMessage" },
    ]);
    GPT_MESSAGES.push({
      role: "assistant",
      content: gptMessage.content,
    });
    setLoading(false);
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      <Head>
        <title>MG Chatbot</title>
        <meta name="description" content="LangChain documentation chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>
          <Image
            src="/mglogo-lockup.png"
            alt="AI"
            width="146"
            height="50"
            className={styles.boticon}
            priority={true}
          />
        </div>
        <div className={styles.navlogo}>
          <a href="/">Magic Matches GPT</a>
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.matches}>
          {creatives &&
            creatives.map((match) => {
              return (
                <div className={styles.match}>
                  <div>
                    <img
                      src={`https://assets.meaningfulgigs.com/${match.hero.source}`}
                      className={styles.hero}
                    />
                  </div>
                  <div className={styles.creativematch}>
                    <img
                      src={`https://assets.meaningfulgigs.com/${match.avatar}`}
                      className={styles.avatar}
                    />
                    <div className={styles.creativedata}>
                      <div>{match.name}</div>
                      <div>{match.specialties[0]}</div>
                      <div>{match.specialties[1]}</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => {
              return (
                // The latest message sent by the user will be animated while waiting for a response
                <div
                  key={index}
                  className={
                    message.type === "userMessage" &&
                    loading &&
                    index === messages.length - 1
                      ? styles.usermessagewaiting
                      : message.type === "apiMessage"
                      ? styles.apimessage
                      : styles.usermessage
                  }
                >
                  {/* Display the correct icon depending on the message type */}
                  {message.type === "apiMessage" ? (
                    <Image
                      src="/mglogo.png"
                      alt="AI"
                      width="30"
                      height="30"
                      className={styles.boticon}
                      priority={true}
                    />
                  ) : (
                    <Image
                      src="/usericon.png"
                      alt="Me"
                      width="30"
                      height="30"
                      className={styles.usericon}
                      priority={true}
                    />
                  )}
                  <div className={styles.markdownanswer}>
                    {/* Messages are being rendered in Markdown format */}
                    <ReactMarkdown linkTarget={"_blank"}>
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                type="text"
                id="userInput"
                name="userInput"
                placeholder={
                  loading ? "Waiting for response..." : "Type your question..."
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? (
                  <div className={styles.loadingwheel}>
                    <CircularProgress color="inherit" size={20} />{" "}
                  </div>
                ) : (
                  // Send icon SVG in input field
                  <svg
                    viewBox="0 0 20 20"
                    className={styles.svgicon}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
