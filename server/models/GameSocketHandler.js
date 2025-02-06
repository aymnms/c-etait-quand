const Game = require("./Game");

class GameSocketHandler {
    constructor(io) {
        this.io = io;
        this.game = new Game(io);
    }

    handleConnection(socket) {
        socket.on("joinGame", ({ playerName, roomCode }) => {
            this.game.joinGame(socket, playerName, roomCode);
        });

        socket.on("nextRound", (roomCode) => {
            this.game.nextRound(roomCode);
        });

        socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
            this.game.submitAnswer(roomCode, playerName, answer);
        });

        socket.on("endRound", (roomCode) => {
            this.game.endRound(roomCode);
        });

        socket.on("disconnect", () => {
            this.game.disconnect(socket);
        });
    }
}

module.exports = GameSocketHandler;