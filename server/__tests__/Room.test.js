const Room = require("../models/Room");

describe("Room", () => {
    let room;
    let mockIo;

    beforeEach(() => {
        room = new Room("ABCDE");
        mockIo = { to: jest.fn(() => ({ emit: jest.fn() })) }; // Mock de io.to().emit()
    });
    
    test("Créer une room et vérifier qu'elle est bien initialisée", () => {
        expect(room.code).toBe("ABCDE");
        expect(room.players.size).toBe(0);
        expect(room.socketIds.size).toBe(0);
        expect(room.currentAnswers.size).toBe(0);
        expect(room.logs.length).toBe(0);
        expect(room.currentQuestion).toBe(null);
    });
    
    test("Ajouter un joueur à une room", () => {
        room.addPlayer("socket123", "drobdilamenace");
        expect(room.players.has("drobdilamenace")).toBe(true);
        expect(room.socketIds.get("socket123")).toBe("drobdilamenace");
    });
    
    test("Retirer un joueur d'une room", () => {
        room.addPlayer("socket123", "zeze");
        room.removePlayer("socket123");
        expect(room.players.has("zeze")).toBe(false);
        expect(room.socketIds.has("socket123")).toBe(false);
    });
    
    test("Soumettre une réponse", () => {
        room.addPlayer("socket123", "zezeonfire");
        room.submitAnswer("zezeonfire", "500");
        expect(room.currentAnswers.get("zezeonfire")).toBe("500");
    });
    
    test("Réinitialiser les réponses", () => {
        room.currentAnswers.set("player1", 1800);
        room.currentAnswers.set("player2", 1900);
        room.resetAnswers();
        expect(room.currentAnswers.size).toBe(0);
    });
    
    test("Mettre à jour les scores", () => {
        room.addPlayer("socket123", "zeze");
        room.addPlayer("socket124", "aymnms");
        room.players.get("zeze").addPoints(3);
        room.players.get("aymnms").addPoints(2);
    
        expect(room.getScores()).toStrictEqual({ zeze: 3, aymnms: 2 });
    });
    
    // Need to handle environment variable into test
    // test("Faire gagner plusieurs joueurs", () => {
    //     room.addPlayer("socket123", "zeze");
    //     room.addPlayer("socket124", "aymnms");
    //     room.addPlayer("socket125", "delus");
    //     const aymnms = room.players.get("aymnms");
    //     const zeze = room.players.get("zeze");
    //     const delus = room.players.get("delus");
    //     aymnms.addPoints(6);
    //     zeze.addPoints(5);
    //     delus.addPoints(2);
    
    //     const winners = room.getWinners();
    
    //     expect(winners.includes("aymnms")).toBe(true);
    //     expect(winners.includes("zeze")).toBe(true);
    //     expect(winners.length).toBe(2);
    // });
    
    test("Ne pas pouvoir ajouter un joueur deux fois", () => {
        room.addPlayer("socket123", "aymnms");
        room.addPlayer("socket124", "aymnms");
        expect(room.players.size).toBe(1);
    });
    
    test("Ne pas pouvoir soumettre une réponse pour un joueur inexistant", () => {
        room.submitAnswer("drobdilegentil", "1980");
        expect(room.currentAnswers.has("drobdilegentil")).toBe(false);
    });
    
    test("resetAnswers() vide bien les réponses en cours", () => {
        room.addPlayer("socket123", "Alice");
        room.submitAnswer("Alice", "1920");
        expect(room.currentAnswers.size).toBe(1);
    
        room.resetAnswers();
        expect(room.currentAnswers.size).toBe(0);
    });
});

/**
 * - Vérifier qu’une salle est bien initialisé avec les bonnes valeurs
 * (code, players, socketIds, currentAnswers, logs & currentQuestionIndex) ✅
 * - Ajouter un joueur et vérifier qu’il est bien dans la room. ✅
 * - Retirer un joueur et vérifier qu’il n’est plus dans la room. ✅
 * - Soumettre une réponse et vérifier qu’elle est bien enregistrée. ✅
 * - Vérifier que les scores sont bien mis à jour. ✅
 * - Vérifier que les gagnants sont bien détectés (ex: score >= 5). ❌
 * - Ne pas pouvoir ajouter un joueur deux fois ✅
 * - Ne pas pouvoir soumettre une réponse pour un joueur inexistant ✅
 * - resetAnswers() vide bien les réponses en cours
 */