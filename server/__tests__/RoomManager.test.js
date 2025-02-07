const RoomManager = require("../models/RoomManager");

describe("RoomManager class", () => {
    let roomManager;

    beforeEach(() => {
        roomManager = new RoomManager();
    });

    test("Créer une salle et vérifier qu'elle existe", () => {
        const roomCode = roomManager.createRoom();
        expect(roomManager.getRoom(roomCode)).toBeDefined();
    });

    test("Supprimer une salle et vérifier qu'elle n'existe plus", () => {
        const roomCode = roomManager.createRoom();
        roomManager.deleteRoom(roomCode);
        expect(roomManager.getRoom(roomCode)).toBeUndefined();
    });

    test("Récupérer une question par son index", () => {
        const question = roomManager.getQuestion(0);
        expect(question).toStrictEqual({
            invention: "Imprimerie",
            year: 1440,
            explanation: "Inventée par Gutenberg."
        });
    });

    test("getQuestion() doit renvoyer undefined pour un index invalide", () => {
        expect(roomManager.getQuestion(-1)).toBeUndefined();
        expect(roomManager.getQuestion(100)).toBeUndefined();
    });
});

/**
 * - Vérifier que la création de room fonctionne. ✅
 * - Vérifier que la suppression de room fonctionne. ✅
 * - Vérifier que l'on récupère la question désiré avec son index ✅
 * - getQuestion() doit renvoyer undefined pour un index invalide ✅
 */