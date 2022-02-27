module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		const date = new Date().toLocaleString('en-GB', { timeZone: 'PST' });
		console.log(`${date}: ${interaction.user.tag} in ${interaction.guild.name}#${interaction.channel.name} triggered an interaction.`);
	},
};