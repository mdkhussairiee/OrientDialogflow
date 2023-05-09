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
	  
    // Get current date
    const currentDate = new Date();

    // Get current date and time
    const currentTime = new Date();

    // Format date as a string
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

    // Format time as a string
    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;

    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDateTime = now.toLocaleString('ms-MY', options);

    let KnowledgeDataset = 
        `Debra knows current date and time now is ${formattedDateTime} \n\n` +
        `Debra knows today date is ${formattedDate} \n\n` +
        `Debra knows current time now is ${formattedTime} \n\n` ;
	  
    const dialog = [
    {
      'role': 'system',
      'content': KnowledgeDataset
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
      'temperature': 0.85,
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
