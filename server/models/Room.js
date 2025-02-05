const Player = require("./Player");

class Room {
    constructor(code) {
        this.code = code;
        this.players = new Map(); // Map(playerName -> Player)
        this.socketIds = new Map(); // Map(socketId -> playerName)
        this.currentAnswers = new Map(); // Map(playerName -> answer)
        this.logs = [];
        this.currentQuestionIndex = 0;
    }

    addPlayer(socketId, playerName) {
        if (!this.players.has(playerName)) {
            this.players.set(playerName, new Player(playerName));
            this.socketIds.set(socketId, playerName);
        }
    }

    removePlayer(socketId) {
        const playerName = this.socketIds.get(socketId);
        if (playerName) {
            this.players.delete(playerName);
            this.socketIds.delete(socketId);
        }
        return playerName;
    }

    submitAnswer(playerName, answer) {
        if (this.players.has(playerName)) {
            this.currentAnswers.set(playerName, answer);
        }
    }

    resetAnswers() {
        this.currentAnswers.clear();
    }

    addLog(log) {
        this.logs.push(log);
    }

    getScores() {
        return Object.fromEntries(
            [...this.players.entries()]
            .map(([name, player]) => [name, player.score])
        );
    }

    getWinners() {
        let winners = [];
        for (const player of this.players.values()) {
            if (player.score >= 5) winners.push(player.name);
        }
        return winners;
    }
}

module.exports = Room;