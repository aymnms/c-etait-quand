const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const ENV = process.env.NODE_ENV || "local";

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2,
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
                callback(null, true);
            } else {
                console.log(`CORS blocked request from: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 5000
});

// let rooms = {};
let rooms = new Map();
let questions = [
    { invention: "Imprimerie", year: 1440, explanation: "Inventée par Gutenberg." },
    { invention: "Téléphone", year: 1876, explanation: "Alexander Graham Bell en est l'inventeur." },
    { invention: "Internet", year: 1969, explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969." }
]

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");
    
    socket.on("joinGame", ({ playerName, roomCode }) => {
        if (!roomCode) {
            roomCode = Math.random().toString(36).substring(2, 7);
            rooms.set(roomCode, {
                players: new Map(),
                socketToPlayer: new Map(),
                currentQuestionIndex: 0,
                currentAnswers: new Map(),
                logs: []
            });
            socket.emit("roomCreated", roomCode);
        }
        
        socket.join(roomCode);
        rooms.get(roomCode).players.set(playerName, 0);
        rooms.get(roomCode).socketToPlayer.set(socket.id, playerName);
        console.log(`${playerName} a rejoint la salle ${roomCode}`);
    });

    socket.on("nextRound", (roomCode) => {
        if (!rooms.has(roomCode)) return;
        rooms.get(roomCode).currentQuestionIndex = Math.floor(Math.random() * questions.length);
        
        let winners = [];
        for (const [player, score] of rooms.get(roomCode).players.entries()) {
            if (score >= 5) winners.push(player);
        }

        if (winners.length) {
            io.to(roomCode).emit("gameEnded", { winners, scores: Object.fromEntries(rooms.get(roomCode).players.entries()), logs: rooms.get(roomCode).logs });
        } else {
            io.to(roomCode).emit("gameStarted", questions[rooms.get(roomCode).currentQuestionIndex]);
        }
    });

    socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
        if (!rooms.has(roomCode)) {
            socket.emit("errorMessage", "La salle n'existe pas !");
            return;
        }
        if (rooms.get(roomCode).players.get(playerName) === undefined) {
            socket.emit("errorMessage", "Le joueur n'existe pas dans cette salle !");
            return;
        }
        rooms.get(roomCode).currentAnswers.set(playerName, answer);
    });

    socket.on("endRound", ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) return;
        const players = room.players;
        const answers = room.currentAnswers;

        // génération du log
        let log = {
            question: questions[room.currentQuestionIndex],
            answers: Object.fromEntries(answers),
            closestPlayers: [],
            perfectWinners: []
        }
        
        // Déterminer qui remporte des points
        let minDiff = Infinity;

        answers.forEach((answer, player) => {
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
        room.logs.push(log);

        // reset currentAnserws
        answers.clear();
        
        // COPIER COLLER GPT - A TESTER ET VERIFIER
        // Mise à jour des scores
        const updateScore = (player, points) => {
            players.set(player, players.get(player) + points);
        };

        if (log.perfectWinners.length) {
            log.perfectWinners.forEach(winner => updateScore(winner, 3));
        } else {
            log.closestPlayers.forEach(winner => updateScore(winner, 1));
        }

        // Envoyer le résultat aux joueurs
        io.to(roomCode).emit("roundResult", {
            winners: log.perfectWinners.length ? log.perfectWinners : log.closestPlayers,
            isPerfectWinners: log.perfectWinners.length,
            explanation: `${log.question.invention} a été inventé en ${log.question.year}. ${log.question.explanation}`,
            scores: Object.fromEntries(players)
        });
    });
    
    socket.on("disconnect", () => {
        for (let [roomCode, roomData] of rooms.entries()) {
            let playerName = roomData.socketToPlayer.get(socket.id);
            if (playerName) {
                console.log(`${playerName} s'est déconnecté`);
                io.to(roomCode).emit("playerDisconnected", playerName);
        
                roomData.players.delete(playerName);
                roomData.socketToPlayer.delete(socket.id);
        
                return;
            }
        }
        console.log("Un joueur s'est déconnecté");
    });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Serveur WebSocket démarré sur le port " + PORT);
});
