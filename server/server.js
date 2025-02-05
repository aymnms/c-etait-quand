const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const Room = require("./models/Room");

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

let questions = [
    { invention: "Imprimerie", year: 1440, explanation: "Inventée par Gutenberg." },
    { invention: "Téléphone", year: 1876, explanation: "Alexander Graham Bell en est l'inventeur." },
    { invention: "Internet", year: 1969, explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969." }
];

let rooms = new Map();

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");
    
    socket.on("joinGame", ({ playerName, roomCode }) => {
        if (!roomCode) {
            roomCode = Math.random().toString(36).substring(2, 7);
            rooms.set(roomCode, new Room(roomCode));
            socket.emit("roomCreated", roomCode);
        }
        
        const room = rooms.get(roomCode);
        room.addPlayer(socket.id, playerName);
        socket.join(roomCode);

        console.log(`${playerName} a rejoint la salle ${roomCode}`);
    });

    socket.on("nextRound", (roomCode) => {
        if (!rooms.has(roomCode)) return;
        const room = rooms.get(roomCode);

        const winners = room.getWinners();
        if (winners.length) {
            io.to(roomCode).emit("gameEnded", { winners, scores: room.getScores(), logs: room.logs });
        } else {
            room.currentQuestionIndex = Math.floor(Math.random() * questions.length);
            io.to(roomCode).emit("gameStarted", questions[room.currentQuestionIndex]);
        }
    });

    socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
        if (!rooms.has(roomCode)) {
            socket.emit("errorMessage", "La salle n'existe pas !");
            return;
        }
        rooms.get(roomCode).submitAnswer(playerName, answer);
    });

    socket.on("endRound", ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        const question = questions[room.currentQuestionIndex];

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

        // Envoyer le résultat aux joueurs
        io.to(roomCode).emit("roundResult", {
            winners: log.perfectWinners.length ? log.perfectWinners : log.closestPlayers,
            isPerfectWinners: log.perfectWinners.length,
            explanation: `${log.question.invention} a été inventé en ${log.question.year}. ${log.question.explanation}`,
            scores: room.getScores()
        });
    });
    
    socket.on("disconnect", () => {
        for (let room of rooms.values()) {
            const playerName = room.removePlayer(socket.id);
            if (playerName) {
                console.log(`${playerName} s'est déconnecté`);
                io.to(roomCode).emit("playerDisconnected", playerName);
                return;
            }
        }
        console.log("Un joueur s'est déconnecté"); // log - indique que joueur déconnecté n'a pas été identifié
    });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Serveur WebSocket démarré sur le port " + PORT);
});
