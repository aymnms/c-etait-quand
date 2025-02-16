const Room = require("./Room");

class RoomManager {
    constructor() {
        this.rooms = new Map();
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
}

module.exports = RoomManager;