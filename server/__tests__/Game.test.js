const Game = require("../models/Game");

test("Créer une salle et vérifier qu'elle existe", () => {
    const game = new Game();
    const roomCode = game.createRoom();
    expect(game.getRoom(roomCode)).toBeDefined();
});

test("Supprimer une salle et vérifier qu'elle n'existe plus", () => {
    const game = new Game();
    const roomCode = game.createRoom();
    game.deleteRoom(roomCode);
    expect(game.getRoom(roomCode)).toBeUndefined();
});

test("Vérifier que l'on récupère la question désiré avec son index", () => {
    const game = new Game();
    const question = game.getQuestion(0);
    const expected_question = {
        invention: "Imprimerie",
        year: 1440,
        explanation: "Inventée par Gutenberg."
    };
    expect(question).toStrictEqual(expected_question);
});

test("getQuestion() doit renvoyer undefined pour un index invalide", () => {
    const game = new Game();
    expect(game.getQuestion(-1)).toBeUndefined();
    expect(game.getQuestion(100)).toBeUndefined();
});

/**
 * - Vérifier que la création de room fonctionne. ✅
 * - Vérifier que la suppression de room fonctionne. ✅
 * - Vérifier que l'on récupère la question désiré avec son index ✅
 * - getQuestion() doit renvoyer undefined pour un index invalide ✅
 */