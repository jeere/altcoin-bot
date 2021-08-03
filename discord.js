require("dotenv").config();
const Discord = require("discord.js");
const discord_client = new Discord.Client();
discord_client.login(process.env.DISCORD_TOKEN);

function log_to_discord(msg) {
  discord_client.channels.cache.get("859412549615222795").send(msg);
}

function post_to_discord(tag, message) {
  if (discord_client) {
    try {
      console.log(`Posting to Discord, Tag: ${tag}, Message: ${message}`);
      switch (String(tag)) {
        case "whale_alert":
          discord_client.channels.cache.get("856615689116712991").send(message);
          break;

        case "muskalert":
          discord_client.channels.cache.get("858661114203471893").send(message);
          break;

        case "willywoo":
          discord_client.channels.cache.get("858662087790428170").send(message);
          break;

        case "rektcapital":
          discord_client.channels.cache.get("858662256911843349").send(message);
          break;

        case "BTCkeskus":
          discord_client.channels.cache.get("858662347694276629").send(message);
          break;

        case "planb":
          discord_client.channels.cache.get("858662436206936065").send(message);
          break;

        case "glassnodealerts":
          discord_client.channels.cache.get("858662505907879977").send(message);
          break;

        case "crypto_lark":
          discord_client.channels.cache.get("860454169978601472").send(message);
          break;

        case "chartsbtc":
          discord_client.channels.cache.get("864814981391974430").send(message);
          break;

        case "BTC_Archive":
          discord_client.channels.cache.get("872082913993297950").send(message);
          break;

        default:
          discord_client.channels.cache.get("856862067865026570").send(message);
          break;
      }
    } catch (e) {
      console.log("Error when posting to discord!");
      console.log(e);
    }
  } else {
    console.log("No Discord client connection found.");
  }
}

module.exports = {
  post_to_discord: post_to_discord,
  discord_client: discord_client,
  log_to_discord: log_to_discord,
};
