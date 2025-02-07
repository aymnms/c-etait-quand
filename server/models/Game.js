const RoomManager = require("./RoomManager");

class Game {
    constructor(io) {
        this.io = io;
        this.roomManager = new RoomManager();
        this.timers = new Map();
    }

    joinGame(socket, playerName, roomCode) {
        if (!roomCode) roomCode = this.roomManager.createRoom();

        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;
        room.addPlayer(socket.id, playerName);
        socket.join(roomCode);
        
        console.log(`${playerName} a rejoint la salle ${roomCode}`);
        socket.emit("roomJoined", roomCode, [...room.players.keys()], room.host);
    }

    nextRound(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;

        const winners = room.getWinners();
        if (winners.length) { // FIN DE GAME
            this.io.to(roomCode).emit("gameEnded", { winners, scores: room.getScores(), logs: room.logs });
            this.io.socketsLeave(roomCode);
            this.io.in(roomCode).disconnectSockets(true);
            this.roomManager.deleteRoom(roomCode);
        } else {
            this.roomManager.randomQuestionIndex(roomCode);
            this.io.to(roomCode).emit("gameStarted", this.roomManager.getQuestion(room.currentQuestionIndex));
            this.startTimer(roomCode);
        }
    }

    submitAnswer(roomCode, playerName, answer) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) {
            socket.emit("errorMessage", "La salle n'existe pas !");
            return;
        }
        room.submitAnswer(playerName, answer);
    }

    startTimer(roomCode) {
        let timeLeft = process.env.TIMER;
        const room = this.roomManager.getRoom(roomCode);
        
        this.timers.set(roomCode, setInterval(() => {
            this.io.to(room.code).emit("timerUpdate", timeLeft);
            console.log(`⏳ Timer ${room.code}: ${timeLeft} sec`);
            
            if (timeLeft <= 0) {
                this.stopTimer(roomCode);
                this.endRound(roomCode);
            }
            
            timeLeft--;
        }, 1000));
    }

    stopTimer(roomCode) {
        if (this.timers.has(roomCode)) {
            clearInterval(this.timers.get(roomCode));
            this.timers.delete(roomCode);
            console.log(`⏹ Timer arrêté pour la salle ${roomCode}`);
        }
    }

    endRound(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;

        this.stopTimer(roomCode);

        const question = this.roomManager.getQuestion(room.currentQuestionIndex);

        let log = {
            question,
            answers: Object.fromEntries(room.currentAnswers),
            closestPlayers: [],
            perfectWinners: []
        }

        let minDiff = Infinity;
        room.currentAnswers.forEach((answer, player) => {
            let diff = Math.abs(answer - log.question.year);

            if (diff < minDiff) {
                minDiff = diff;
                log.closestPlayers = [player];
            } else if (diff === minDiff) {
                log.closestPlayers.push(player);
            }

            if (answer === log.question.year) {
                log.perfectWinners.push(player);
            }
        });

        room.addLog(log);
        room.resetAnswers();

        if (log.perfectWinners.length) {
            log.perfectWinners.forEach(winner => room.players.get(winner).addPoints(3));
        } else {
            log.closestPlayers.forEach(winner => room.players.get(winner).addPoints(1));
        }

        this.io.to(roomCode).emit("roundResult", {
            winners: log.perfectWinners.length ? log.perfectWinners : log.closestPlayers,
            isPerfectWinners: log.perfectWinners.length > 0,
            explanation: `${log.question.invention} a été inventé en ${log.question.year}. ${log.question.explanation}`,
            scores: room.getScores()
        });
    }

    disconnect(socket) {
        for (let [roomCode, room] of this.roomManager.rooms.entries()) {
            const playerName = room.removePlayer(socket.id);
            if (playerName) {
                console.log(`❌ ${playerName} s'est déconnecté de la salle ${roomCode}`);
                this.io.to(roomCode).emit("playerDisconnected", playerName, room.host);
    
                // Expulser le joueur de la room WebSocket
                socket.leave(roomCode);
    
                // Vérifier si la room est vide
                if (room.players.size === 0) {
                    console.log(`🗑️ Room ${roomCode} supprimée (dernier joueur parti).`);
                    
                    // Expulser tous les sockets de la room avant suppression
                    this.io.socketsLeave(roomCode);
    
                    // Supprimer la room de la mémoire
                    this.roomManager.deleteRoom(roomCode);
                }
    
                // Forcer la fermeture de la connexion WebSocket du joueur
                socket.disconnect(true);

                return;
            }
        }
        console.log("Un joueur s'est déconnecté sans être dans une room.");
    }
}

module.exports = Game;