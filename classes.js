// source: https://stackoverflow.com/questions/50066309/how-to-auto-remove-elements-out-of-an-array-after-x-minutes-in-javascript

class gameArray extends Array {
	constructor(timeout) {
		super();
		this.timeout = timeout;
	}
	push() {
		const i1 = this.length;
		const i2 = super.push(...arguments);
		setTimeout(() => {
			for (let i = i1; i < i2; i++) delete this[i];
		}, this.timeout);
		return i2;
	}
  }

class Game {
	constructor(gameID, initialUid, privacy, word) {
		this.gameID = gameID;
		this.initialUid = initialUid;
		this.privacy = privacy;
		this.word = word;
		this.pages = [];
		this.guesses = [];
		this.messageIDs = [];
	}
}
module.exports.GameArray = gameArray;
module.exports.Game = Game;