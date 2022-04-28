const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const Games = sequelize.define('games', {
        gameID: {
            type: Sequelize.STRING,
            unique: true,
        },
        initialUid: {
            type: Sequelize.STRING,
        },
        privacy: {
            type: Sequelize.STRING,
        },
        word: {
            type: Sequelize.STRING,
        },
        guesses: {
            type: Sequelize.JSON,
        },
        win: {
            type: Sequelize.STRING,
        },
    });
    return Games;
};