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

const avatars = [
    "Avatar1.png",
    "Avatar2.png",
    "Avatar3.png"
];

let myself = {
    name: "",
    indexAvatar: 0,
    score: 0
}

let party = {
    roomCode: "",
    playerHostName: "",
    players: [],
    step: "home"
}

function goToSetupPage(isHost) {
    if (isHost) {
        document.getElementById("setup-code").style.display = "none";
        document.getElementById("setup-next").innerText = "CRÉER"
    }
    updateDisplay("setup");
}

function changeAvatar(direction) {
    let avatarElement = document.getElementById("setup-avatar");

    let index = myself.indexAvatar + direction;
    if (index >= avatars.length) index = 0;
    else if (index < 0) index = avatars.length - 1;

    
    myself.indexAvatar = index;
    console.log(myself.indexAvatar);
    avatarElement.src = "img/" + avatars[myself.indexAvatar];
}

function joinGame() {
    myself.name = document.getElementById("setup-playerInput").value.trim();
    if (!myself.name) return createToast("Entrez un nom de joueur", "error");
    roomCodeElement = document.getElementById("setup-code");
    if (roomCodeElement.style.display !== "none") {
        party.roomCode = roomCodeElement.value.trim();
        if (!party.roomCode) return createToast("Entrez un code de room", "error");
    }
    socket.emit("joinGame", { playerName: myself.name, indexAvatar: myself.indexAvatar, roomCode: party.roomCode });
}

function displayQuestion(question) {
    document.getElementById("question").innerText = `${question.invention}`;
    document.getElementById("questionImage").src=question.image;
    document.getElementById("questionImage").alt=question.invention;
}

function submitAnswer() {
    let answerElement = document.getElementById("answer");
    let answer = parseInt(answerElement.value);
    if (isNaN(answer)) {
        createToast("La réponse n'est pas un nombre.");
        return;
    }
    socket.emit("submitAnswer", { roomCode: party.roomCode, playerName: myself.name, answer });
    answerElement.value = "";
}

function nextRound() {
    socket.emit("nextRound", party.roomCode);
}

function updateHostDisplay() {
    if (myself.name == party.playerHostName) {
        if (document.getElementById("waiting").style.display === "block") {
            document.getElementById("startGame").style.display = "block";
            document.getElementById("next").style.display = "none";
        }
        else if (document.getElementById("results").style.display === "block") {
            document.getElementById("startGame").style.display = "none";
            document.getElementById("next").style.display = "block";
        }
    }
}

function updateDisplay(step) {
    party.step = step;

    let displays = {
        "home": "none",
        "setup": "none",
        "waiting": "none",
        "game": "none",
        "spinner": "none",
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
    for (const player of party.players) {
        listElement += `<div class="player">
            <img src="img/${avatars[player.avatar]}" alt="Avatar ${player.name}" class="player-avatar">
            <p class="player-name">${player.name}</p>
        </div>`
    }
    for (const HtmlElement of HtmlList) {
        HtmlElement.innerHTML = listElement;
    }

    document.getElementById("nbPlayer").innerText = `JOUEUR ${party.players.length}/10`
}

function createToast(message, type = "info") {

    colorClass = type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-secondary';

    // colorClasssss = [
    //     'text-bg-primary',
    //     'text-bg-danger',
    //     'text-bg-info',
    //     'text-bg-success',
    //     'text-bg-secondary',
    // ];

    // 1) Crée l'élément principal
    const toastEl = document.createElement('div');
    
    // 2) Les classes Bootstrap nécessaires
    toastEl.classList.add('toast', 'align-items-center', colorClass, 'border-0', 'fade');
  
    // 3) Attributs
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    // Durée avant auto-hide (ms)
    toastEl.dataset.bsAutohide = 'true';
    toastEl.dataset.bsDelay = '5000';

    // 4) InnerHTML : structure du toast
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    `;
  
    // 5) Place-le dans le conteneur
    const toastContainer = document.getElementById('toastContainer');
    toastContainer.appendChild(toastEl);
    
    // 6) Initialise le toast
    const bsToast = new bootstrap.Toast(toastEl);
    
    // 7) Affiche-le
    bsToast.show();
  }


// ------- WEBSOCKET ------- //

socket.on("roomJoined", (code, players, host) => {
    party.roomCode = code;
    party.players = players;
    party.playerHostName = host;
    updateDisplay("waiting");
    updateHostDisplay();
    displayPlayerList();
    document.getElementById("roomCode").innerText = `CODE: ${code}`;
});

socket.on("gameStarted", (question) => {
    updateDisplay("game");
    displayQuestion(question);
});

socket.on("timerUpdate", (timeLeft) => {
    const timerElement = document.getElementById("timer");
    timerElement.innerText = timeLeft;
});

socket.on("askAnswers", () => {
    submitAnswer();
    updateDisplay("spinner");
});

socket.on("roundResult", ({ solution, explanation, scores, answers }) => {
    updateDisplay("results");

    document.getElementById("solution").innerText = solution;
    document.getElementById("explanation").innerText = explanation;

    let playerCards = document.getElementById("player-cards");
    playerCards.innerHTML = "";
    for (let localPlayer of party.players) {
        const answer = answers[localPlayer.name] ? answers[localPlayer.name] : "❌";
        playerCards.innerHTML += `
        <div class="player-card">
            <p class="guessed-date">${answer}</p>
            <img src="img/${avatars[localPlayer.avatar]}" alt="${localPlayer.name}" class="player-avatar">
            <p class="player-name">${localPlayer.name}</p>
            <p class="player-score">${scores[localPlayer.name]}</p>
        </div>
        `;
    }
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

socket.on("message", (message, type) => {
    createToast(message, type);
});

socket.on("playerDisconnected", (player, host) => {
    createToast(`${player} vient de quitter la room`, "info");
    for (let localPlayer of party.players) {
        if (localPlayer.name === player) {
            party.players.splice(party.players.indexOf(localPlayer), 1);
        }
    }
    displayPlayerList();
    if (party.playerHostName != host) {
        party.playerHostName = host;
        if (party.playerHostName === myself.name){
            updateHostDisplay();
            create("Vous êtes devenu le nouvel hôte !", "info");
        }
    }
});

updateDisplay("home");
