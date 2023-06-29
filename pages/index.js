import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import { getKeywords, getMatches, getSummary } from "../pages/api/chat";

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

    const response = await getKeywords(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: response.content, type: "apiMessage" },
    ]);

    // Reset user input
    setUserInput("");

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message:
          "OK, I'll search our database of designers to find the best matches for you, based on what you've told me.",
        type: "apiMessage",
      },
    ]);

    const matches = await getMatches(response.keywords);
    setCreatives(matches);

    const summary = await getSummary(matches);

    setMessages((prevMessages) => [
      ...prevMessages,
      { message: summary, type: "apiMessage" },
    ]);
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
          <a href="/">Magic Matches GPT v0.2</a>
        </div>
      </div>
      <div className={styles.container}>
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
      </div>
    </>
  );
}
