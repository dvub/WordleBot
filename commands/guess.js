const { SlashCommandBuilder } = require('@discordjs/builders');
const { currentGames } = require('./play.js');
const { Possible, Solutions } = require('../words.js');
const { MessageEmbed } = require('discord.js');
// create a list of all words
const allWords = Possible.concat(Solutions);
const { ButtonPaginator } = require('@psibean/discord.js-pagination');

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
	async execute(Games, interaction) {
		const gameID = interaction.options.get('game-id').value;
		const interactingUid = interaction.member.user.id;
		const guess = interaction.options.get('guess').value.toLowerCase();

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
				// otherwise, the letter gets displayed for better readability
				else {
					wordDisplay += '⬛ ';
				}

			}
			// new line
			wordDisplay += '\n';
		});
		let win = null;
		console.log(currentGame.word);
		// checking if there's a win or loss
		let winMsg = 'Not available.';
		try {
			if (guess === currentGame.word) {
				currentGames.splice(currentGame, 1);
				winMsg = `<@${interactingUid}> got it! The word was:\n\`${guess}\``;
				win = true;
			}
			if (currentGame.guesses.length === 6 && currentGame.guesses[5] != currentGame.word) {
				currentGames.splice(currentGame, 1);
				winMsg = `You didn't get the word! \n The word was:\n\`${currentGame.word}\``;
				win = false;
			}
		}
		catch (error) {
			console.log(error);
		}
		if (win) {
			await Games.create({
				gameID: currentGame.gameID,
				initialUid: currentGame.initialUid,
				privacy: currentGame.privacy,
				word: currentGame.word,
				guesses: currentGame.guesses,
				win: win,
			});
		}
		// build the embed
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Wordle')
			.setURL('https://www.nytimes.com/games/wordle/index.html')
			.setAuthor({ name: `${interaction.member.user.username}'s Game`, iconURL: interaction.member.user.avatarURL() })
			.setThumbnail(interaction.guild.iconURL())
			.setDescription(`<@${interactingUid}> guessed \`${guess.toUpperCase()}\`.`)
			.addField('Current Guesses', wordDisplay, true)
			.addField('Result', winMsg, true)
			.setTimestamp()
			.setFooter({ text: `Game ID: ${currentGame.gameID}` });
		// const message =
		await interaction.reply('Current Game:');
		currentGame.pages.unshift(embed);
		// currentGame.messageIDs.push(message.id); CAUSES CRASHING
		const buttonPaginator = new ButtonPaginator(interaction, { pages: currentGame.pages });
		await buttonPaginator.send();
	},
};
