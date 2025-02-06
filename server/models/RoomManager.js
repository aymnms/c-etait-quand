const Room = require("./Room");

class RoomManager {
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
}

module.exports = RoomManager;