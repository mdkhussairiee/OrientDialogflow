const express = require("express");
require("actions-on-google")
require('dotenv').config();
const axios = require('axios');
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();

app.post("/dialogflow", express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", defaultFallback);
  agent.handleRequest(intentMap);

  function welcome(agent) {
    agent.add('Hi, I am Debra! I am your virtual personal assistant from Orient Telecoms. How are you doing today?');
  }

  async function defaultFallback(agent) {
    const dialog = [
      {
        'role': 'system',
        'content': 'Debra is an AI assistant for Orient Telecoms that can have meaningful conversations with users. Debra is created by Orient Telecoms.
        '
      },
      {
        'role': 'assistant',
        'content': 'Hello, I am Debra! I am your virtual personal assistant from Orient Telecoms. How are you doing today?'
      },
      {
        'role': 'user',
        'content': agent.query
      }
    ];

    const completionParmas = {
      'model': 'gpt-3.5-turbo',
      'messages': dialog,
      'max_tokens': 300,
      'temperature': 0.6,
    };

    try {
      const result = await axios.post('https://api.openai.com/v1/chat/completions', completionParmas, {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      });
      const botResponse = result.data.choices[0].message.content.trim();
      agent.add(botResponse);
    } catch (err) {
      console.log(err);
      agent.add('Sorry. Something went wrong. Can you say that again?');
    }
  }
});

const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`))
