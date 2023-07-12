import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import {
  converse,
  getMatches,
  getKeywords,
  getSummary,
} from "../pages/api/chat";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [creatives, setCreatives] = useState(null);
  const [debug, setDebug] = useState([]);

  const [messages, setMessages] = useState([
    {
      message: "Hi there! Tell me about your design needs.",
      type: "apiMessage",
    },
  ]);

  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

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

    // render the user's input in the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: userInput, type: "userMessage" },
    ]);

    // send user input to GPT and await response
    setLoading(true);
    let gptMessage = await converse(userInput, "user");

    // logic branch for when GPT requests an API call
    if (gptMessage.finish_reason === "function_call") {
      // retrieve keywords from function arguments
      // and add to any existing keywords
      const newKeywords = await getKeywords(gptMessage);
      const totalKeywords = new Set([...keywords, ...newKeywords]);

      // logic branch for no new keywords parsed,
      // or no keywords parsed at all
      if (
        ([...keywords].every((keyword) => totalKeywords.has(keyword)) &&
          totalKeywords.size === keywords.length) ||
        totalKeywords.size === 0
      ) {
        // in this case, tell GPT to ask a follow-up question
        const log = [...totalKeywords].toString() || "None";
        setDebug((prevDebug) => [...prevDebug, log]);
        const systemInput =
          "You haven't collected any new keywords.  Ask a probing question to try and get more detail from the user.";
        gptMessage = await converse(systemInput);
      }
      // logic branch for when GPT has parsed new keywords
      else {
        // in this case, a few actions occur...

        // first, update keyword log
        setKeywords([...totalKeywords]);
        const log = [...totalKeywords].toString() || "None";
        setDebug((prevDebug) => [...prevDebug, log]);

        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   {
        //     message:
        //       "Got it!  Hold on while I look for some designers that match what you're asking for.",
        //     type: "apiMessage",
        //   },
        // ]);

        // next, ask GPT to tell the user there will be a brief
        // hold while matching designers are being found
        // if there is message content as well, render it in the chat
        if (gptMessage.message.content) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { message: gptMessage.message.content, type: "apiMessage" },
          ]);
        } else {
          const systemInput =
            "You now have new keywords!  In just a few words, tell the user to wait while you review their needs and look through available designers.";
          gptMessage = await converse(systemInput);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: gptMessage.message.content,
              type: "apiMessage",
            },
          ]);
        }

        // third, call the API to retrieve the matches
        const matches = await getMatches([...totalKeywords]);

        // fourth, ask GPT to explain the results
        const top3 = matches.slice(0, 3);
        gptMessage = await getSummary(top3);
        setCreatives(top3);
      }
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: gptMessage.message.content,
        type: "apiMessage",
      },
    ]);

    // Reset user input
    setUserInput("");

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

  const toggleDebug = (e) => {
    e.preventDefault();
    const element = document.getElementById("debug");
    element.style.display = "block";
  };

  return (
    <>
      <Head>
        <title>MG Chatbot</title>
        <meta name="description" content="Meaningful Gigs chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://uploads-ssl.webflow.com/645001ed7d5053811b578ae0/646cfaf127078f9c63cc74d4_mg-favicon.png"
        />
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
          <a onClick={toggleDebug}>Magic Matches v0.7.1</a>
        </div>
      </div>
      <div id="debug" className={styles.debug}>
        <div className={styles.debugheader}>DEBUG</div>
        <div className={styles.debuglogs}>
          {debug.map((log) => (
            <p>Keywords Parsed: {log.replaceAll(",", ", ")}</p>
          ))}
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.matches}>
          {creatives &&
            creatives.map((match) => {
              return (
                <div
                  className={styles.match}
                  onClick={() =>
                    window.open(
                      `https://showcase.meaningfulgigs.com/portfolios/${match._id}`,
                      "_blank"
                    )
                  }
                >
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
                      <h3>{match.name}</h3>
                      <div>
                        {match.specialties[0].replace("Design", "")}
                        <br />
                        {match.specialties[1] &&
                          match.specialties[1].replace("Design", "")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <main className={styles.main}>
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
                        : message.type === "apiMessage" &&
                          loading &&
                          index === messages.length - 1
                        ? styles.apimessagewaiting
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
                    loading
                      ? "Waiting for response..."
                      : "Type your question..."
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
      </div>
    </>
  );
}
