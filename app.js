require("dotenv").config();
require("log-timestamp");
const needle = require("needle");
const Discord = require("discord.js");
const discord_client = new Discord.Client();
const CLIENTID = process.env.DISCORD_TOKEN;
discord_client.login(CLIENTID);
const token = process.env.TWITTER_BEARER_TOKEN;

/* Heroku requries express end point for the servers */
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
/* Heroku config end */

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id";

const rules = [
  {
    value:
      "from:elonmusk OR from:CoinDesk OR from:TheBlock__ OR from:TheCryptolark OR from:coinbureau OR from:Cointelegraph OR from:DocumentingBTC OR from:BTC_Archive OR from:glassnode OR from:cryptoquant_com OR from:coinmetrics OR from:AltcoinDailyio OR from:RhythmicAnalyst OR from:MMCrypto OR from:cz_binance OR from:CoinMarketCap OR from:RaoulGMI",
    tag: "twitter from tag",
  },
  {
    value: "from:whale_alert",
    tag: "whale_alert",
  },
  {
    value:
      "(from:elonmusk BTC) OR (from:elonmusk crypto) OR (from:elonmusk eth) OR (from:elonmusk bitcoin) OR (from:elonmusk coin) OR (from:elonmusk doge)",
    tag: "muskalert",
  },
  {
    value: "from:woonomic",
    tag: "willywoo",
  },
  {
    value: "from:rektcapital",
    tag: "rektcapital",
  },
  {
    value: "from:BTCkeskus",
    tag: "BTCkeskus",
  },
  {
    value: "from:100trillionUSD",
    tag: "planb",
  },
  {
    value: "from:glassnodealerts",
    tag: "glassnodealerts",
  },
];

async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

function streamConnect(retryAttempt) {
  console.info("Forming twitter stream connection..");
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  console.info("Formed the twitter stream connection.");

  stream
    .on("data", (data) => {
      try {
        const json = JSON.parse(data);
        console.info(json);
        post_to_discord(json);
        // A successful connection resets retry count.
        retryAttempt = 0;
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
          console.log("keep alive signal");
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        process.exit(1);
      } else {
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    })
    .on("done", function (err) {
      // if our request had an error, our 'done' event will tell us.
      if (!err) {
        console.log("Stream is done. Great success!");
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      } else {
        console.log(err);
      }
    })
    .on("timeout", function (err) {
      // if our request had an error, our 'done' event will tell us.
      console.log("Stream has timeout!");
      if (!err) console.log(err);
    });

  return stream;
}

(async () => {
  let currentRules;
  try {
    currentRules = await getAllRules();
    console.log(currentRules);
    await deleteAllRules(currentRules);
    await setRules();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  streamConnect(0);
})();

discord_client.once("ready", () => {
  console.info(`Logged in as ${discord_client.user.tag}!`);
});

function post_to_discord(json) {
  try {
    console.log(`source: ${json.data.source}`);
    console.log(`matching rule: ${json.matching_rules[0].tag}`);

    switch (String(json.matching_rules[0].tag)) {
      case "whale_alert":
        discord_client.channels.cache
          .get("856615689116712991")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "willywoo":
        discord_client.channels.cache
          .get("858662087790428170")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "rektcapital":
        discord_client.channels.cache
          .get("858662256911843349")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "BTCkeskus":
        discord_client.channels.cache
          .get("858662347694276629")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "planb":
        discord_client.channels.cache
          .get("858662436206936065")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "glassnodealerts":
        discord_client.channels.cache
          .get("858662505907879977")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      case "muskalert":
        discord_client.channels.cache
          .get("858661114203471893")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;

      default:
        discord_client.channels.cache
          .get("856862067865026570")
          .send(
            `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`
          );
        break;
    }
  } catch (e) {
    console.log("Error when posting to discord!");
    console.log(e);
  }
}

process.on("exit", function (code) {
  return console.log(`About to exit with code ${code}`);
});

process.on("SIGINT", function () {
  process.exit();
});
