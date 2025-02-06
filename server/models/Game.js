const Room = require("./Room");

class Game {
    constructor() {
        this.rooms = new Map();
        this.questions = [
            { invention: "Imprimerie", year: 1440, explanation: "Inventée par Gutenberg." },
            { invention: "Téléphone", year: 1876, explanation: "Alexander Graham Bell en est l'inventeur." },
            { invention: "Internet", year: 1969, explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969." }
        ];
    }

    createRoom() {
        const roomCode = Math.random().toString(36).substring(2, 7);
        this.rooms.set(roomCode, new Room(roomCode));
        return roomCode;
    }

    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }

    deleteRoom(roomCode) {
        this.rooms.delete(roomCode);
    }

    randomQuestionIndex(roomCode) {
        const room = this.getRoom(roomCode);
        if (!room) return;
        room.currentQuestionIndex = Math.floor(Math.random() * this.questions.length);
    }

    getQuestion(index) {
        return this.questions[index];
    }

    // Gestion des cycles des rooms

    joinGame(socket, playerName, roomCode) {
        if (!roomCode) {
            roomCode = this.createRoom();
            socket.emit("roomCreated", roomCode);
        }
        
        const room = this.getRoom(roomCode);
        room.addPlayer(socket.id, playerName);
        socket.join(roomCode);

        console.log(`${playerName} a rejoint la salle ${roomCode}`);
    }

    nextRound(io, roomCode) {
        const room = this.getRoom(roomCode);
        if (!room) return;

        const winners = room.getWinners();
        if (winners.length) {
            io.to(roomCode).emit("gameEnded", { winners, scores: room.getScores(), logs: room.logs });
        } else {
            this.randomQuestionIndex(roomCode);
            io.to(roomCode).emit("gameStarted", this.getQuestion(room.currentQuestionIndex));
            this.startTimer(io, roomCode);
            this.endRound();
        }
    }

    submitAnswer(socket, roomCode, playerName, answer) {
        if (!this.getRoom(roomCode)) {
            socket.emit("errorMessage", "La salle n'existe pas !");
            return;
        }
        this.getRoom(roomCode).submitAnswer(playerName, answer);
    }

    startTimer(io, roomCode) {
        let timeLeft = 10;

        const room = this.getRoom(roomCode);
        
        room.timer = setInterval(() => {
            io.to(room.code).emit("timerUpdate", timeLeft);
            console.log(timeLeft);
            
            if (timeLeft <= 0) {
                console.log("ARRET DU TIMER 1");
                this.stopTimer(io, roomCode);
            }
            
            timeLeft--;
        }, 1000);
    }
    
    stopTimer(io, roomCode) {
        const room = this.getRoom(roomCode);
        if (room.timer) {
            clearInterval(room.timer);
            room.timer = null;
            console.log("ARRET DU TIMER 2");
            this.endRound(io, roomCode);
        }
    }

    endRound(io, roomCode) {
        const room = this.getRoom(roomCode);
        if (!room) return;

        console.log("ENDROUND");
        

        this.stopTimer(io, roomCode);

        const question = this.getQuestion(room.currentQuestionIndex);

        // génération du log
        let log = {
            question,
            answers: Object.fromEntries(room.currentAnswers),
            closestPlayers: [],
            perfectWinners: []
        }
        
        // Déterminer qui remporte des points
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

        // add log to logs
        room.addLog(log);

        // reset currentAnserws
        room.resetAnswers();
        
        // Mise à jour des scores
        if (log.perfectWinners.length) {
            log.perfectWinners.forEach(winner => room.players.get(winner).addPoints(3));
        } else {
            log.closestPlayers.forEach(winner => room.players.get(winner).addPoints(1));
        }

        console.log("YO");
        

        // Envoyer le résultat aux joueurs
        io.to(roomCode).emit("roundResult", {
            winners: log.perfectWinners.length ? log.perfectWinners : log.closestPlayers,
            isPerfectWinners: log.perfectWinners.length > 0,
            explanation: `${log.question.invention} a été inventé en ${log.question.year}. ${log.question.explanation}`,
            scores: room.getScores()
        });
    }

    disconnect(socket, io) {
        for (let room of this.rooms.values()) {
            const playerName = room.removePlayer(socket.id);
            if (playerName) {
                console.log(`${playerName} s'est déconnecté`);
                io.to(room.code).emit("playerDisconnected", playerName);
                return;
            }
        }
        console.log("Un joueur s'est déconnecté"); // log - indique que joueur déconnecté n'a pas été identifié
    }
}

module.exports = Game;