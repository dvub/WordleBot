// running this file will register slash commands GLOBALLY.

const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

console.log('Reading commands from ./commands');
const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let total = 0;
for (const file of commandFiles) {
	total++;
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
console.log(`Read ${total} commands.`);


const rest = new REST({ version: '9' }).setToken(process.env.DJS_TOKEN);
rest.put(
	Routes.applicationCommands(process.env.CLIENT_ID),
	{ body: commands },
);
console.log('Registered global commands');
