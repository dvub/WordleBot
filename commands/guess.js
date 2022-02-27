const { SlashCommandBuilder } = require('@discordjs/builders');
const { currentGames } = require('./play.js');
const { Possible, Solutions } = require('../words.js');
const { MessageEmbed } = require('discord.js');

// create a list of all words
const allWords = Possible.concat(Solutions);

// create slash command and options, etc
const command = new SlashCommandBuilder()
	.setName('guess')
	.setDescription('Guess a word for an ongoing wordle game!')
	.addStringOption(option =>
	option.setName('game-id')
		.setDescription('ID of the game you would like to guess for.')
		.setRequired(true),
)
.addStringOption(option =>
	option.setName('guess')
		.setDescription('5-letter word to guess.')
		.setRequired(true),
);

module.exports = {
	data: command,
	async execute(interaction) {
		const gameID = interaction.options.get('game-id').value;
		const interactingUid = interaction.member.user.id;
		const guess = interaction.options.get('guess').value;

		const currentGame = currentGames.filter(game => {
			return game.gameID === gameID;
		})[0];


		// a few tests with return clauses
		if (!currentGame) {
			await interaction.reply({
				content: 'Error: No such game exists.',
				ephemeral: true,
			});
			return;
		}
		if (currentGame.privacy === true && interactingUid != currentGame.initialUid) {
			await interaction.reply({
				content: 'Error: Tried to play in a private game',
				ephemeral: true,
			});
		}
		// make sure that words are 5-letters and are on the list
		// true to the game
		if (!(guess.length === 5)) {
			await interaction.reply({
				content: 'Please input a 5-letter word.',
				ephemeral: true,
			});
			return;
		}
		if (!(allWords.includes(guess))) {
			await interaction.reply({
				content: 'Thats not a valid word.',
				ephemeral: true,
			});
			return;
		}

		// add the guess to the array of guesses for the current game
		currentGame.guesses.push(interaction.options.get('guess').value);
		// build the word display
		let wordDisplay = '';

		currentGame.guesses.forEach(x => {
			for (let i = 0; i < x.length; i++) {
				// if the letter is the same in the exact position, we get green
				if (currentGame.word[i] === x[i]) {
					wordDisplay += '🟩 ';
				}
				// if the letter exists in the word, we get yellow
				else if (currentGame.word.includes(x[i])) {
					wordDisplay += '🟨 ';
				}
				// otherwise, gray
				else {
					wordDisplay += '⬛ ';
				}

			}
			// new line
			wordDisplay += '\n';
		});
		// fill in the rest of the display based on the amount of guesses left
		for (let i = 0; i < (6 - currentGame.guesses.length); i++) {
			wordDisplay += '⬛ ⬛ ⬛ ⬛ ⬛ \n';
		}

		// checking if there's a win or loss
		let winMsg = '';
		if (guess === currentGame.word) {
			currentGames.splice(currentGame, 1);
			winMsg = `<@${interactingUid}> got it!`;
		}
		if (currentGame.guesses.length === 6) {
			currentGames.splice(currentGame, 1);
			winMsg = 'You didn\'t get the word!';
		}
		// build the embed
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Wordle')
			.setURL('https://www.nytimes.com/games/wordle/index.html')
			.setAuthor({ name: `${interaction.member.user.username}'s Game`, iconURL: interaction.member.user.avatarURL() })
			.setThumbnail(interaction.guild.iconURL())
			.setDescription(`<@${interactingUid}> guessed \`${interaction.options.get('guess').value}\`. \n ${winMsg}`)
			.addField('Current Guesses', wordDisplay, true)
			.setTimestamp()
			.setFooter({ text: `Game ID: ${currentGame.gameID}` });
		// actually send the embed with the proper privacy
		await interaction.reply({
			ephemeral: currentGame.privacy,
			embeds: [embed],
		});
	},
};