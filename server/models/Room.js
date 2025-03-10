const Player = require("./Player");
const { getRandomQuestion, getQuestion } = require("../database");
require("dotenv").config();

class Room {
    constructor(code) {
        this.code = code;
        this.players = new Map(); // Map(playerName -> Player)
        this.host = "";
        this.socketIds = new Map(); // Map(socketId -> playerName)
        this.currentQuestion = null;
        this.currentAnswers = new Map(); // Map(playerName -> answer)
        this.logs = [];
        this.timer = null;
    }

    addPlayer(socketId, playerName, indexAvatar) {
        if (!this.players.has(playerName)) {
            this.players.set(playerName, new Player(playerName, indexAvatar));
            this.socketIds.set(socketId, playerName);
            if (!this.host) {
                this.host = playerName;
            }
        }
    }
    
    removePlayer(socketId) {
        const playerName = this.socketIds.get(socketId);
        if (playerName) {
            this.players.delete(playerName);
            this.socketIds.delete(socketId);
            if (this.host === playerName){
                this.setNewHost();
            }
        }
        return playerName;
    }

    async changeQuestion() {
        try {
            const question = await getRandomQuestion();
            this.currentQuestion = question;
        } catch (error) {
            console.log(error);
        }
    }

    async getQuestionById(question_id) {
        try {
            const question = await getQuestion(question_id);
            return question;
        } catch (error) {
            console.log(error);
        }
    }

    submitAnswer(playerName, answer) {
        if (this.players.has(playerName)) {
            this.currentAnswers.set(playerName, answer);
        }
    }

    allAnswersReceived() {
        let isDone = true;
        this.players.forEach((player, playerName) => {
            if (!this.currentAnswers.has(playerName)) isDone = false;
        });
        return isDone;
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
            if (player.score >= process.env.POINT_WIN) winners.push(player.name);
        }
        return winners;
    }

    setNewHost() {
        this.host = this.players.size > 0 ? this.players.keys().next().value : "";
    }
}

module.exports = Room;