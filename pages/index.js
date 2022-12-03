const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const qs = require("qs");

const config = {
  channelAccessToken: "GKWRLyGHPejtN+zvRwd0gQ3ApynUG7cfdvBJ9wZKKAKfvyWKaoYNopbQc0tj6pEBUDt8iZxGqMSUorIL0Eh+5Ov4gX3l4XLtBijeP+L/7SJhIcIMCrPC0S22lOyQN+3BC+jlyKEUPo17Ee4nN5K4YgdB04t89/1O/w1cDnyilFU=", // add your channel access token
  channelSecret: "80bc895684f08292660ce48edd98763e", // add your channel secret
};

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxwNNJ4PY7Q-Y-Yt2koN8Id9f9QiHiNe8KDA9O95ZsNsMpKTh9PnUnb_BhL1v5lsgw/exec"; // add your google app script url

const app = express();

app.get("/api", (req, res) => res.send("Hello World!"));

app.post("/api/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.Client(config);
async function handleEvent(event) {
  console.log("event", event);
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  try {
    const data = await axios.post(
      APPS_SCRIPT_URL,
      qs.stringify({
        text: event.message.text,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(data.data);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: data.data.message,
    });
  } catch (err) {
    console.error(err);

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "กรุณาลองใหม่อีกครั้งค่ะ",
    });
  }
}

module.exports = app;
