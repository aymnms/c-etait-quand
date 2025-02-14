const Room = require("./Room");

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.questions = [
            {
                invention: "Imprimerie",
                image: "https://www.entrepreneur-individuel.fr/wp-content/uploads/2022/06/imprimeur.jpg",
                year: 1440,
                explanation: "Inventée par Gutenberg."
            },
            {
                invention: "Téléphone",
                image: "https://cdn.futura-sciences.com/cdn-cgi/image/width=1920,quality=50,format=auto/sources/images/dossier/1944/portable2.jpg",
                year: 1876,
                explanation: "Alexander Graham Bell en est l'inventeur."
            },
            {
                invention: "Internet",
                image: "https://cdn.futura-sciences.com/cdn-cgi/image/width=1920,quality=50,format=auto/sources/images/actu/icann-internet-nom-de-domaine.jpg",
                year: 1969,
                explanation: "ARPANET, ancêtre d'Internet, a vu le jour en 1969."
            }
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

    cleanEmptyRooms() { // delete all empty rooms
        this.rooms.forEach((room, roomCode) => {
            if (room.players.size <= 0) {
                this.deleteRoom(roomCode);
            }
        });
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