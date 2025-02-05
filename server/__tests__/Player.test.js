const Player = require("../models/Player");

test("Un joueur commence avec un score de 0", () => {
    const player = new Player("aymnms");
    expect(player.score).toBe(0);
});

test("Ajout de points au score", () => {
    const player = new Player("drobdi");
    player.addPoints(3);
    expect(player.score).toBe(3);
    player.addPoints(2);
    expect(player.score).toBe(5);
});

/**
 * - Vérifier qu’un joueur commence avec 0 point. ✅
 * - Ajouter des points et vérifier que le score est mis à jour. ✅
 */
