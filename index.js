const { Client, Intents, Collection } = require('discord.js');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;
require('dotenv').config();
const fs = require('fs');
const Sequelize = require('sequelize');


// LOGGING

// setting up the logger, we will have 2 files.
// we have a custom format as well
const logger = createLogger({
	exitOnError: false,
	silent: false,
	format: combine(
		timestamp(),
		prettyPrint(),
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: 'logs/combined.log' }),
	],
});
// here, the logger handles and logs all exceptions
// so we don't have to do any of it ourselves
logger.exceptions.handle(
	new transports.File({ filename: 'logs/exceptions.log' }),
);
logger.on('error', (err) => console.log(`${err}`));

// DATABASE

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

(async () => {
	try {
	await sequelize.authenticate();
	logger.log({
		level: 'info',
		message: 'Successfully connected to the database.',
	});
}
catch (error) {
	console.error('Unable to connect to the database:', error);
}
})();
const Games = require(`${__dirname}/models/Games`)(sequelize);


// BOT SECTION

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
// read command and event files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// read and require all command files
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// read and require all events
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		if (event.name === 'ready') {
			Games.sync();
		}
		client.once(event.name, (...args) => event.execute(logger, ...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(logger, ...args));
	}
}

// execute commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(Games, interaction);
	}
	catch (error) {
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		console.log(error);
	}
});
client.login(process.env.DJS_TOKEN);