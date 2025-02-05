const Room = require("../models/Room");

test("Créer une room et vérifier qu'elle est bien initialisée", () => {
    const room = new Room("ABCDE");
    expect(room.code).toBe("ABCDE");
    expect(room.players.size).toBe(0);
    expect(room.socketIds.size).toBe(0);
    expect(room.currentAnswers.size).toBe(0);
    expect(room.logs.length).toBe(0);
    expect(room.currentQuestionIndex).toBe(0);
});

test("Ajouter un joueur à une room", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "drobdilamenace");
    expect(room.players.has("drobdilamenace")).toBe(true);
    expect(room.socketIds.get("socket123")).toBe("drobdilamenace");
});

test("Retirer un joueur d'une room", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "zeze");
    room.removePlayer("socket123");
    expect(room.players.has("zeze")).toBe(false);
    expect(room.socketIds.has("socket123")).toBe(false);
});

test("Soumettre une réponse", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "zezeonfire");
    room.submitAnswer("zezeonfire", "500");
    expect(room.currentAnswers.get("zezeonfire")).toBe("500");
});

test("Récupérer les scores sous le bon format", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "zeze");
    room.addPlayer("socket124", "aymnms");
    const aymnms = room.players.get("aymnms");
    const zeze = room.players.get("zeze");
    aymnms.addPoints(4);
    zeze.addPoints(3);

    const scores_expected = { "aymnms": 4, "zeze": 3 }

    expect(room.getScores()).toStrictEqual(scores_expected);
});

test("Faire gagner plusieurs joueurs", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "zeze");
    room.addPlayer("socket124", "aymnms");
    room.addPlayer("socket125", "delus");
    const aymnms = room.players.get("aymnms");
    const zeze = room.players.get("zeze");
    const delus = room.players.get("delus");
    aymnms.addPoints(6);
    zeze.addPoints(5);
    delus.addPoints(2);

    const winners = room.getWinners();

    expect(winners.includes("aymnms")).toBe(true);
    expect(winners.includes("zeze")).toBe(true);
    expect(winners.length).toBe(2);
});

test("Ne pas pouvoir ajouter un joueur deux fois", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "aymnms");
    room.addPlayer("socket124", "aymnms");
    expect(room.players.size).toBe(1);
});

test("Ne pas pouvoir soumettre une réponse pour un joueur inexistant", () => {
    const room = new Room("12345");
    room.submitAnswer("drobdilegentil", "1980");
    expect(room.currentAnswers.has("drobdilegentil")).toBe(false);
});

test("resetAnswers() vide bien les réponses en cours", () => {
    const room = new Room("12345");
    room.addPlayer("socket123", "Alice");
    room.submitAnswer("Alice", "1920");
    expect(room.currentAnswers.size).toBe(1);

    room.resetAnswers();
    expect(room.currentAnswers.size).toBe(0);
});

/**
 * - Vérifier qu’une salle est bien initialisé avec les bonnes valeurs
 * (code, players, socketIds, currentAnswers, logs & currentQuestionIndex) ✅
 * - Ajouter un joueur et vérifier qu’il est bien dans la room. ✅
 * - Retirer un joueur et vérifier qu’il n’est plus dans la room. ✅
 * - Soumettre une réponse et vérifier qu’elle est bien enregistrée. ✅
 * - Vérifier que les scores sont bien mis à jour. ✅
 * - Vérifier que les gagnants sont bien détectés (ex: score >= 5). ✅
 * - Ne pas pouvoir ajouter un joueur deux fois ✅
 * - Ne pas pouvoir soumettre une réponse pour un joueur inexistant ✅
 * - resetAnswers() vide bien les réponses en cours
 */