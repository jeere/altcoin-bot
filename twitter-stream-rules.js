require("dotenv").config();
const needle = require("needle");
const token = process.env.TWITTER_BEARER_TOKEN;
const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";

const rules = [
  {
    value:
      "(from:elonmusk BTC) OR (from:elonmusk crypto) OR (from:elonmusk eth) OR (from:elonmusk bitcoin) OR (from:elonmusk coin) OR (from:elonmusk has:images) OR (from:elonmusk Doge)",
    tag: "muskalert",
  },
  {
    value:
      "(from:elonmusk -BTC) OR (from:elonmusk -crypto) OR (from:elonmusk -eth) OR (from:elonmusk -bitcoin) OR (from:elonmusk -coin) OR (from:elonmusk -has:images) OR (from:elonmusk -Doge)",
    tag: "twitter from tag",
  },
  {
    value:
      "from:CoinDesk OR from:TheBlock__ OR from:Cointelegraph OR from:DocumentingBTC OR from:glassnode OR from:cryptoquant_com OR from:coinmetrics OR from:AltcoinDailyio OR from:RhythmicAnalyst OR from:MMCrypto OR from:cz_binance OR from:CoinMarketCap OR from:RaoulGMI",
    tag: "twitter from tag",
  },
  {
    value: "from:Kryptosuomii",
    tag: "kryptosuomii",
  },
  {
    value: "from:WClementeIII",
    tag: "WClementeIII",
  },
  {
    value: "from:coinbureau",
    tag: "coinbureau",
  },
  {
    value: "from:BTC_Archive",
    tag: "BTC_Archive",
  },
  {
    value: "from:ChartsBtc",
    tag: "chartsbtc",
  },
  {
    value: "from:TheCryptoLark",
    tag: "crypto_lark",
  },
  {
    value: "from:whale_alert",
    tag: "whale_alert",
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
  {
    value: "from:DCLBlogger",
    tag: "nft",
  },
  {
    value: "from:beaniemaxi",
    tag: "nft",
  },
  {
    value: "from:elliotrades",
    tag: "nft",
  },
  {
    value: "from:elliotrades",
    tag: "nft",
  },
  {
    value: "from:ZssBecker",
    tag: "nft",
  },
];

module.exports = {
  rules: rules,
  getAllRules: async function getAllRules() {
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
  },
  deleteAllRules: async function deleteAllRules(rules) {
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
  },
  setRules: async function setRules() {
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
  },
};
