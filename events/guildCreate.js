// when the bot joins a server

module.exports = {
    name: 'guildCreate',
    execute(logger, guild) {
        logger.log({
            level: 'info',
            message: `Joined a new guild: ${guild.name}`,
        });
    },
};