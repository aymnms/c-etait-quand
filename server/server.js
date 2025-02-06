const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const Game = require("./models/Game");

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

const game = new Game();

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");
    
    socket.on("joinGame", ({ playerName, roomCode }) => {
        game.joinGame(socket, playerName, roomCode);
    });

    socket.on("nextRound", (roomCode) => {
        game.nextRound(io, roomCode);
    });

    socket.on("submitAnswer", ({ roomCode, playerName, answer }) => {
        game.submitAnswer(socket, roomCode, playerName, answer);
    });

    socket.on("endRound", ({ roomCode }) => {
        game.endRound(io, roomCode);
    });
    
    socket.on("disconnect", () => {
        game.disconnect(socket, io);
    });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Serveur WebSocket démarré sur le port " + PORT);
});
