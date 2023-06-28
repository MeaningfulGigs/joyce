const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: req.body.history,
  });

  const data = await response.json();

  res.status(200).json({ result: data });
}
