// when the bot leaves a server

module.exports = {
    name: 'guildDelete',
    execute(logger, guild) {
        logger.log({
            level: 'info',
            message: `Left a guild: ${guild.name}`,
        });
    },
};