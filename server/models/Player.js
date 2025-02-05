module.exports = class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
    }

    addPoints(points) {
        this.score += points;
    }
}