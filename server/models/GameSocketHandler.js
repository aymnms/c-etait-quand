const Game = require("./Game");

class GameSocketHandler {
    constructor(io) {
        this.io = io;
        this.game = new Game(io);
    }

    async handleConnection(socket) {
        socket.on("joinGame", ({ playerName, indexAvatar, roomCode }) => {
            this.game.joinGame(socket, playerName, indexAvatar, roomCode);
        });

        await socket.on("nextRound", (roomCode) => {
            this.game.nextRound(roomCode);
        });

        socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
            this.game.submitAnswer(roomCode, playerName, answer);
        });

        socket.on("endRound", (roomCode) => {
            this.game.endRound(roomCode);
        });

        socket.on("leave", () => {
            this.game.leave(socket);
        });

        socket.on("disconnect", () => {
            this.game.disconnect(socket);
        });
    }
}

module.exports = GameSocketHandler;