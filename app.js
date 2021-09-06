require("dotenv").config();
require("log-timestamp");
const needle = require("needle");
const { post_to_discord, discord_client } = require("./discord");
const {
  getAllRules,
  deleteAllRules,
  setRules,
} = require("./twitter-stream-rules");

const token = process.env.TWITTER_BEARER_TOKEN;
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id";

let keep_alive_counter = 0;
let last_stream_date_received = new Date();
last_stream_date_received.setSeconds(
  last_stream_date_received.getSeconds() + 60
);

discord_client.once("ready", () => {
  console.info(`Logged in as ${discord_client.user.tag}!`);
});

function streamConnect(retryAttempt) {
  setLatestStreamDataReceived();

  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
  });

  stream
    .on("data", (data) => {
      try {
        const json = JSON.parse(data);
        console.log(json);

        let tag = json.matching_rules[0].tag;
        let message = `https://twitter.com/${json.includes.users[0].username}/status/${json.data.id}`;
        if (tag && message) {
          post_to_discord(tag, message);
        } else {
          console.log("Couldn't start posting to Discord.");
        }
        retryAttempt = 0;
        keep_alive_counter = 0;
        setLatestStreamDataReceived();
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(
            "This stream is currently at the maximum allowed connection limit."
          );
          setTimeout(() => {
            console.warn("A connection error occurred. Reconnecting...");
            streamConnect(++retryAttempt);
          }, 2 ** retryAttempt);
        } else {
          keep_alive_counter++;
          console.log(`keep alive ${keep_alive_counter}`);
          setLatestStreamDataReceived();
        }
      }
    })
    .on("err", (error) => {
      console.log("on err");
      console.log(error);
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
      console.log("on done");
      if (!err) console.log(err);
    });

  return stream;
}

function setLatestStreamDataReceived() {
  last_stream_date_received = new Date();
  last_stream_date_received.setSeconds(
    last_stream_date_received.getSeconds() + 22
  );
}

(async () => {
  let currentRules;
  try {
    console.log("-> Getting all rules. ");
    currentRules = await getAllRules();
    console.log("-> Deleting all rules. ");
    await deleteAllRules(currentRules);
    console.log("-> Setting new rules. ");
    await setRules();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  console.log("-> Starting the stream. ");
  streamConnect(0);
})();

function checkIntervalForReconnect() {
  current_time = new Date();
  if (last_stream_date_received < current_time) {
    console.log("Reconnect from interval");
    last_stream_date_received = new Date();
    last_stream_date_received.setSeconds(
      last_stream_date_received.getSeconds() + 60
    );
    console.log(`timer set to: ${last_stream_date_received}`);

    (async () => {
      let currentRules;
      try {
        console.log("-> Getting all rules. ");
        currentRules = await getAllRules();
        console.log("-> Deleting all rules. ");
        await deleteAllRules(currentRules);
        console.log("-> Setting new rules. ");
        await setRules();
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      console.log("-> Starting the stream. ");
      streamConnect(0);
    })();
  }
}

setInterval(checkIntervalForReconnect, 1000);

process.on("exit", function (code) {
  return console.log(`About to exit with code ${code}`);
});

process.on("SIGINT", function () {
  process.exit(-1);
});
