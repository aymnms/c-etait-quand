const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {};
let questions = [
    { invention: "Imprimerie", year: 1440, explanation: "Inventée par Gutenberg." },
    { invention: "Téléphone", year: 1876, explanation: "Alexander Graham Bell en est l'inventeur." },
    { invention: "Internet", year: 1969, explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969." }
];

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");
    
    socket.on("joinGame", ({ playerName, roomCode }) => {
        if (!roomCode) {
            roomCode = Math.random().toString(36).substring(2, 7);
            rooms[roomCode] = {
                players: {},
                currentQuestionIndex: 0,
                currentAnswers: {},
                logs: []
            };
            socket.emit("roomCreated", roomCode);
        }
        
        socket.join(roomCode);
        rooms[roomCode].players[playerName] = 0;
        console.log(`${playerName} a rejoint la salle ${roomCode}`);
    });

    socket.on("nextRound", (roomCode) => {
        if (!rooms[roomCode]) return;
        rooms[roomCode].currentQuestionIndex = Math.floor(Math.random() * questions.length);
        
        let winners = Object.keys(rooms[roomCode].players).filter(player => rooms[roomCode].players[player] >= 5);
        if (winners.length) {
            io.to(roomCode).emit("gameEnded", { winners, scores: rooms[roomCode].players, logs: rooms[roomCode].logs });
        } else {
            io.to(roomCode).emit("gameStarted", questions[rooms[roomCode].currentQuestionIndex]);
        }
    });

    socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
        if (!rooms[roomCode]) return;
        rooms[roomCode].currentAnswers[playerName] = answer;
    });

    socket.on("endRound", ({ roomCode }) => {
        // génération du log
        let log = {
            question: questions[rooms[roomCode].currentQuestionIndex],
            answers: rooms[roomCode].currentAnswers,
            closestPlayers: [],
            perfectWinners: []
        }
        
        // qui remporte des points ?
        let minDiff = Infinity;
        let players = Object.keys(rooms[roomCode].players);

        players.forEach(player => {
            let answer = log.answers[player];
            let diff = Math.abs(answer - log.question.year);
            if (diff === minDiff) {
                log.closestPlayers.push(player);
            }
            else if (diff < minDiff) {
                minDiff = diff;
                log.closestPlayers = []
                log.closestPlayers.push(player);
            }
            if (answer === log.question.year) {
                log.perfectWinners.push(player);
            }
        });

        // add log to logs
        rooms[roomCode].logs.push(log);

        // reset currentAnserws
        rooms[roomCode].currentAnswers = {}

        // update des scores
        if (log.perfectWinners.length) {
            log.perfectWinners.forEach(winner => {
                rooms[roomCode].players[winner] += 3;
            });
        } else {
            log.closestPlayers.forEach(winner => {
                rooms[roomCode].players[winner] += 1;
            });
        }

        // emit resultat aux joueurs
        io.to(roomCode).emit("roundResult", {
            winners: log.perfectWinners.length ? log.perfectWinners : log.closestPlayers,
            isPerfectWinners: log.perfectWinners.length,
            explanation: `${log.question.invention} a été inventé en ${log.question.year}. ${log.question.explanation}`,
            scores: rooms[roomCode].players
        });
    });
    
    socket.on("disconnect", () => {
        console.log("Un joueur s'est déconnecté");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Serveur WebSocket démarré sur le port 3000");
});
