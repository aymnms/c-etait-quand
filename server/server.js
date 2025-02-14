const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const GameSocketHandler = require("./models/GameSocketHandler");

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

const gameSocketHandler = new GameSocketHandler(io);

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");
    gameSocketHandler.handleConnection(socket);
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket démarré sur le port ${PORT}`);
});
