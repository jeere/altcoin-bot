const needle = require("needle");
const { post_to_discord, log_to_discord } = require("./discord");
const token = process.env.TWITTER_BEARER_TOKEN;

const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=attachments,author_id,created_at,public_metrics,source&expansions=author_id";

function streamConnect() {
  console.info("=> Forming twitter stream connection..");
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });
  console.info("=> Formed the twitter stream connection.");
  return stream;
}

module.exports = {
  streamConnect: streamConnect,
};
