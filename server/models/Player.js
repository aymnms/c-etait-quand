class Player {
    constructor(name, indexAvatar) {
        this.name = name;
        this.avatar = indexAvatar;
        this.score = 0;
    }

    addPoints(points) {
        this.score += points;
    }
}

module.exports = Player;