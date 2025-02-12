const ENV = window.location.href.includes("index.html") ? "local" : window.location.href.includes("preprod") ? "preprod" : "prod";

const CONFIG = {
    local: {
        BACKEND_URL: "http://localhost:3000",
    },
    preprod: {
        BACKEND_URL: "https://c-etait-quand-back-preprod.onrender.com",
    },
    prod: {
        BACKEND_URL: "https://c-etait-quand-back.onrender.com",
    }
};

if (ENV != "prod") document.title = ENV.toUpperCase() + " - " + document.title;

const BACKEND_URL = CONFIG[ENV].BACKEND_URL;

const socket = io(BACKEND_URL);
let playerName = "";
let playersName = []
let roomCode = "";
let hostName = "";

function goToSetupPage(isHost) {
    if (isHost) {
        document.getElementById("setup-code").style.display = "none";
        document.getElementById("setup-next").innerText = "CRÉER"
    }
    updateDisplay("setup");
}

function joinGame() {
    playerName = document.getElementById("setup-playerInput").value.trim();
    if (!playerName) return alert("Entrez un nom de joueur");
    roomCodeElement = document.getElementById("setup-code");
    if (roomCodeElement.style.display !== "none") {
        roomCode = roomCodeElement.value.trim();
        if (!roomCode) return alert("Entrez un code de room");
    }
    socket.emit("joinGame", { playerName, roomCode });
    // socket.emit("joinGame", { playerName, indexAvatar, roomCode });
}

function displayQuestion(question) {
    document.getElementById("question").innerText = `C'était quand... ${question.invention} ?`;
    document.getElementById("questionImage").src=question.image;
    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = `<p>${playerName} : <input type='number' id='answer'></p>`;
}

function validateAnswers() {
    let answer = parseInt(document.getElementById("answer").value);
    if (isNaN(answer)) return;
    socket.emit("submitAnswer", { roomCode, playerName, answer });
}

function nextRound() {
    socket.emit("nextRound", roomCode);
}

function updateHostDisplay() {
    if (playerName == hostName) {
        if (document.getElementById("waiting").style.display === "block") {
            document.getElementById("startGame").style.display = "block";
            //document.getElementById("next").style.display = "none"; // QUAND RESULT SERA OK
        }
        else if (document.getElementById("results").style.display === "block") {
            document.getElementById("startGame").style.display = "none";
            //document.getElementById("next").style.display = "block"; // QUAND RESULT SERA OK
        }
    }
}

function updateDisplay(step) {
    let displays = {
        "home": "none",
        "setup": "none",
        "waiting": "none",
        "game": "none",
        "results": "none",
        "endGame": "none",
    }

    displays[step] = "block";

    for (const key in displays) {
        document.getElementById(`${key}`).style.display = displays[key];
    }
}

function displayPlayerList() {
    const HtmlList = [
        document.getElementById("playerListWaiting"),
        // document.getElementById("playerListGame")
    ];
    let listElement = ""
    for (const player of playersName) {
        listElement += `<div class="player">
            <img src="img/Avatar1.png" alt="Avatar ${player}" class="player-avatar">
            <p class="player-name">${player}</p>
        </div>`
    }
    for (const HtmlElement of HtmlList) {
        HtmlElement.innerHTML = listElement;
    }

    document.getElementById("nbPlayer").innerText = `JOUEUR ${playersName.length}/10`
}

function changeAvatar(direction) {
    const avatars = [
        "Avatar1.png",
        "Avatar2.png",
        "Avatar3.png"
    ];

    let avatar = document.getElementById("setup-avatar");
    let src = avatar.src.split("/");
    src = src[src.length - 1];
    
    let index = avatars.indexOf(src) + direction;
    if (index >= avatars.length) {
        index = 0;
    } else if (index < 0) {
        index = avatars.length - 1;
    }

    avatar.src = "img/" + avatars[index];
}

// ------- WEBSOCKET ------- //

socket.on("roomJoined", (code, players, host) => {
    roomCode = code;
    playersName = players;
    hostName = host;
    updateDisplay("waiting");
    updateHostDisplay();
    displayPlayerList();
    document.getElementById("roomCode").innerText = `ROOM ${code}`;
});

socket.on("gameStarted", (question) => {
    updateDisplay("game");
    displayQuestion(question);
});

socket.on("timerUpdate", (timeLeft) => {
    const timerElement = document.getElementById("timer");
    timerElement.innerText = timeLeft;
});

socket.on("roundResult", ({ winners, isPerfectWinners, explanation, scores, answers }) => {
    updateDisplay("results");
    let roundResultMessage = `${winners.join(",")} gagne(nt)`;
    roundResultMessage += isPerfectWinners ? ` 3 points !` : ` 1 point !`;
    document.getElementById("roundResult").innerText = roundResultMessage;
    document.getElementById("explanation").innerText = explanation;

    let answersTable = document.getElementById("currentAnswers");
    answersTable.innerHTML = "<tr><th>Joueurs</th><th>Réponses</th></tr>";
    Object.keys(answers).forEach(player => {
        console.log(player + " " + answers[player]);
        answersTable.innerHTML += `<tr><td>${player}</td><td>${answers[player]}</td></tr>`;
    });

    let currentScoresTable = document.getElementById("currentScores");
    currentScoresTable.innerHTML = "<tr><th>Joueur</th><th>Score</th></tr>";
    Object.keys(scores).forEach(player => {
        currentScoresTable.innerHTML += `<tr><td>${player}</td><td>${scores[player]}</td></tr>`;
    });
    updateHostDisplay();
});

socket.on("gameEnded", ({ winners, scores, logs }) => {
    updateDisplay("endGame");
    document.getElementById("winner").innerText = `Gagnants : ${winners.join(", ")}`;
    let finalScoresTable = document.getElementById("finalScores");
    finalScoresTable.innerHTML = "<tr><th>Joueurs</th><th>Scores</th></tr>";
    Object.keys(scores).forEach(player => {
        finalScoresTable.innerHTML += `<tr><td>${player}</td><td>${scores[player]}</td></tr>`;
    });
    console.log(logs);
});

socket.on("errorMessage", (message) => {
    alert(message);
});

socket.on("playerDisconnected", (player, host) => {
    alert(player + " vient de quitter la partie");
    playersName = playersName.filter(item => item !== player);
    displayPlayerList();
    if (hostName != host) {
        hostName = host;
        if (hostName === playerName){
            updateHostDisplay();
            alert("Vous êtes devenu le nouvel hôte !");
        }
    }
});

updateDisplay("home");
