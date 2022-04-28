// fires when an interaction occurs. used for logging purposes.

module.exports = {
	name: 'interactionCreate',
	execute(logger, interaction) {
		logger.log({
			level: 'info',
			message: {
				user: interaction.user.tag,
				guild: `${interaction.guild.name}#${interaction.channel.name}`,
				interaction: interaction.toString(),

			},
		});
	},
};