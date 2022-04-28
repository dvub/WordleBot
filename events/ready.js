// fires when bot is ready

function execute(logger, client) {
	logger.log({
		level: 'info',
		message: `Ready: logged in as ${client.user.tag}.`,
	});
}
module.exports = {
	name: 'ready',
	once: true,
	execute,
};