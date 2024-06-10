const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const fs = require('fs');
const dataFilePath = './anonymous_usernames.json'; // File path

var http = require('http');

http.createServer(function(req, res) {
  res.write("I'm alive");
  res.end();
}).listen(8080)

// Load data on startup (or create an empty object)
let anonymousUsernames = {};
try {
  const data = fs.readFileSync(dataFilePath);
  anonymousUsernames = JSON.parse(data);
} catch (err) {
  if (err.code === 'ENOENT') { // If file doesn't exist, create it
    fs.writeFileSync(dataFilePath, JSON.stringify(anonymousUsernames));
  } else {
    console.error('Error loading data:', err);
  }
}

const TOKEN = "MTI0ODQ2NzkxNDcxODQ0OTgwNg.GikN8d.UkVzSkQd37MU4wDht3R8v_ZU7GnFsnXDRNXLnA"; // Replace with your actual bot token
const CONFESSION_CHANNEL_ID = '1246653314804879411';
const LOG_CHANNEL_ID = '1237728907130703965';

async function generateAndStoreAnonUsername(userId) {
  let anonUsername = anonymousUsernames[userId];
  if (!anonUsername) {
    anonUsername = `Anon-${Math.random().toString(36).substring(2, 8)}`;
    anonymousUsernames[userId] = anonUsername;
    fs.writeFileSync(dataFilePath, JSON.stringify(anonymousUsernames));
  }
  return anonUsername;
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    activities: [{ name: 'Polri RBX', type: ActivityType.Streaming, url: 'https://discord.gg/kepolisian-republik-indonesia-roblox-789830879442108436' }],
    status: 'online'
  });

  const confessCommand = new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Submit an anonymous confession.')
    .addStringOption(option => option.setName('message').setDescription('Your confession').setRequired(true));

  await client.guilds.cache.get('789830879442108436').commands.create(confessCommand); // Replace 'YOUR_GUILD_ID' with the actual ID
  });

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'confess') return;

  const confession = interaction.options.getString('message');
  const confessor = interaction.user;
  const anonUsername = await generateAndStoreAnonUsername(confessor.id); // Get/generate and store the username

  const confessionChannel = await client.channels.fetch(CONFESSION_CHANNEL_ID);
  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID); // Fetch log channel earlier

  // Log Embed (sent to the log channel) - Moved up
  const logEmbed = new EmbedBuilder()
    .setColor('#0099ff') // Blue color for the log
    .setTitle('Confession Log')
    .setDescription(`**Confessor:** ${confessor.tag} (${confessor.id})\n**Anonymous Name:** ${anonUsername}\n**Confession:** ${confession}`)
    .setTimestamp();

  await logChannel.send({ embeds: [logEmbed] });

  // Confession Embed (sent to public channel)
  const confessionEmbed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setAuthor({ name: `[${anonUsername}]`, iconURL: 'https://st4.depositphotos.com/34984980/37843/v/450/depositphotos_378433462-stock-illustration-eye-icon-vector-look-vision.jpg' }) // Set author with anonymous username and optional icon
    .setDescription(confession)
    .setTimestamp();
  await confessionChannel.send({ embeds: [confessionEmbed] });


  await interaction.reply({ content: 'Your confession has been submitted anonymously.', ephemeral: true });
});



client.login(TOKEN);
