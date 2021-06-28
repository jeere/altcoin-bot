require("dotenv").config();
const Discord = require("discord.js");
const discord_client = new Discord.Client();
const CLIENTID = process.env.TOKEN;
discord_client.login(CLIENTID);

let text =
  "Big boy/girl rules eli Big boy/girl housut jalkaan ku tekee muuveja eli omalla vastuulla! Olkoon kryptojumalat meille armollisia!";

  // metamask: https://metamask.io/faqs.html
  // matic bridge:  https://www.youtube.com/playlist?list=PLslsfan1R_z0Epvnqsj29V1LBAh99dzu9
  // binance bridge:  https://binance-wallet.gitbook.io/binance-bridge/guides/binance-bridge-v3
  // yield farming: https://autofarm.gitbook.io/autofarm-network/how-tos/defi-beginners-guide/beginner-guides/liquidity-mining-and-yield-farming

  var msg = new Discord.MessageEmbed()
  .setColor("#AFDEDC")
  .setTitle(`FAQ:`)
  .addField("Metamask ohjeet", "[Click here](https://metamask.io/faqs.html)", false)
  .addField("Matic bridge ohjeet", "[Click here](https://www.youtube.com/playlist?list=PLslsfan1R_z0Epvnqsj29V1LBAh99dzu9)", false)
  .addField("Binance bridge ohjeet", "[Click here](https://binance-wallet.gitbook.io/binance-bridge/guides/binance-bridge-v3)", false)
  .addField("Yield farming aloittelijan opas", "[Click here](https://autofarm.gitbook.io/autofarm-network/how-tos/defi-beginners-guide/beginner-guides/liquidity-mining-and-yield-farming)", false)

discord_client.once("ready", () => {
  console.info(`Logged in as ${discord_client.user.tag}!`);


  discord_client.channels.cache.get("858669460592656434").send(msg);
});

