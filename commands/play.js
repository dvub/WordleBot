const { SlashCommandBuilder } = require('@discordjs/builders');
const { Solutions } = require('../words.js');
const { Game, GameArray } = require('../classes.js');
const { MessageEmbed } = require('discord.js');
// used to handle all ongoing games
// removes games after 15 minutes -> 900000 ms
const games = new GameArray(900000);

// build slash command
const command = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Start a game of wordle!')
	.addStringOption(option =>
	option.setName('privacy')
		.setDescription('Set the privacy of your game.')
		.setRequired(true)
		.addChoice('public', 'public')
		.addChoice('private', 'private'),
);
module.exports = {
	data: command,
	async execute(interaction) {
		// allows the user to create a new game, public or private
		const privacy = (interaction.options.get('privacy').value === 'private') ? true : false;
		const gameID = Math.floor(Math.random() * Date.now()).toString();
		const solution = Solutions[Math.floor(Math.random() * Solutions.length)];
		const uid = interaction.member.user.id;
		const privacyMsg = (privacy === false) ? 'Since it\'s a public game, anyone can play!' : 'Since it\'s a private game, only you can guess!';
		const game = new Game(gameID, uid, privacy, [], solution);
		games.push(game);
		const msgEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('New Wordle Game')
			.setThumbnail(interaction.guild.iconURL())
			.setURL('https://www.nytimes.com/games/wordle/index.html')
			.setAuthor({ name: `${interaction.member.user.username}'s New Game`, iconURL: interaction.member.user.avatarURL() })
			.setDescription(`<@${interaction.member.user.id}> Started a New Game!`)
			.addField('Game ID', gameID, true)
			.addField('How To Play?', `Type \`/guess\` with the game ID above to play in this game! \n${privacyMsg}`)
			.setTimestamp()
			.setFooter({ text: `Game ID: ${gameID}` });

		await interaction.reply({
			ephemeral: privacy,
			embeds: [msgEmbed],
		});
	},
	currentGames: games,
};