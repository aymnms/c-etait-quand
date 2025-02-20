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

let party;
resetParty();

function resetParty() {
    party = {
        roomCode: "",
        playerHostName: "",
        players: [],
        step: "home",
        roundTime: (ENV === "local") ? 10 : 30,
        timer: 0
    }
}

function goToSetupPage(isHost) {
    if (isHost) {
        document.getElementById("setup-code").style.display = "none";
        document.getElementById("setup-next").innerText = "CRÉER";
    } else {
        document.getElementById("setup-code").style.display = "";
        document.getElementById("setup-next").innerText = "REJOINDRE";
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
    document.getElementById("questionImage").src=question.imageUrl;
    document.getElementById("questionImage").alt=question.invention;
}

function submitAnswer() {
    let answerElement = document.getElementById("answer");
    let answer = parseInt(answerElement.value);
    if (isNaN(answer)) {
        if (answerElement.value == "") answer = "";
        else createToast("La réponse n'est pas un nombre.");
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

function displayPlayerListEndGame() {
    console.log(party.players);
    
    let sortPlayerList = party.players;
    sortPlayerList.sort((a, b) => b.score - a.score);
    
    let playerListElement = document.getElementById("playerListEndGame");
    let listElement = "";
    for (const player of sortPlayerList) {
        let index = sortPlayerList.indexOf(player) + 1;
        if (index == 1) {
            listElement += `<div class="player player-first">`;
        } else if (index == 2) {
            listElement += `<div class="player player-second">`;
        } else if (index == 3) {
            listElement += `<div class="player player-third">`;
        } else {
            listElement += `<div class="player">`;
        }

        if (index == 1) {
            listElement += `<div class="player-rank">1er</div>`;
        } else {
            listElement += `<div class="player-rank">${index}e</div>`;
        }
        listElement += `<img src="img/${avatars[player.avatar]}" alt="${player.name}" class="player-avatar-endgame">
            <div class="player-score-endgame">${player.score}</div>
            <p class="player-name-endgame">${player.name}</p>
        </div>`;
    }
    console.log(party.players.length);
    
    for (let i = 0; i < 10 - party.players.length; i++) {        
        listElement += `<div class="player player-empty-slot"></div>`;
    }
    playerListElement.innerHTML = listElement;
}

function displayPlayerListWaiting() {
    let playerListElement = document.getElementById("playerListWaiting");
    let listElement = "";
    for (const player of party.players) {
        listElement += `<div class="player">
            <img src="img/${avatars[player.avatar]}" alt="Avatar ${player.name}" class="player-avatar-waiting">
            <p class="player-name-waiting">${player.name}</p>
        </div>`;
    }
    for (let i = 0; i < 10 - party.players.length; i++) {
        listElement += `<div class="player player-empty-slot"></div>`;
    }
    playerListElement.innerHTML = listElement;

    document.getElementById("nbPlayer").innerText = `JOUEUR ${party.players.length}/10`;
}

function displayPlayerListResults(scores, answers) {
    let playerCards = document.getElementById("player-cards");
    playerCards.innerHTML = "";
    for (let localPlayer of party.players) {
        localPlayer.score = scores[localPlayer.name];
        const answer = answers[localPlayer.name] ? answers[localPlayer.name] : "❌";
        playerCards.innerHTML += `
        <div class="player-card">
            <p class="guessed-date">${answer}</p>
            <img src="img/${avatars[localPlayer.avatar]}" alt="${localPlayer.name}" class="player-avatar-results">
            <p class="player-name">${localPlayer.name}</p>
            <p class="player-score">${scores[localPlayer.name]}</p>
        </div>
        `;
    }
    for (let i = 0; i < 10 - party.players.length; i++) {
        playerCards.innerHTML += `<div class="player-card player player-empty-slot"></div>`;
    }
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

function back(from) {
    if (from === "setup") {
        updateDisplay("home");
    }
    else if (from === "waiting") {
        // déconnecter le joueur
        socket.emit("leave");
        resetParty();
        // goTo setup
        updateDisplay("setup");
    }
    else if (from === "endGame") {
        updateDisplay("home");
    }
}

function updateTimer(timeLeft) {
    const timerElement = document.getElementById("timer");
    let progress = timeLeft / party.roundTime;
    timerElement.style.background = `conic-gradient(transparent ${progress*100}%, #2C1E37 0)`;
}

function animationTimer() {
    const timerInterval = setInterval(() => {
        if (party.timer > 0) {
            party.timer -= 0.1;
            updateTimer(party.timer);
        } else {
            clearInterval(timerInterval);
        }
    }, 100);
}

// ------- WEBSOCKET ------- //

socket.on("roomJoined", (code, players, host) => {
    party.roomCode = code;
    party.players = players;
    party.playerHostName = host;
    updateDisplay("waiting");
    updateHostDisplay();
    displayPlayerListWaiting();
    document.getElementById("roomCode").innerText = `CODE: ${code}`;
});

socket.on("gameStarted", (question) => {
    updateDisplay("game");
    displayQuestion(question);
});

socket.on("timerUpdate", (timeLeft) => {
    party.timer = timeLeft;
    if (timeLeft == party.roundTime) {
        animationTimer()
    }
});

socket.on("askAnswers", () => {
    submitAnswer();
    updateDisplay("spinner");
});

socket.on("roundResult", ({ solution, explanation, scores, answers }) => {
    updateDisplay("results");

    document.getElementById("solution").innerText = solution;
    document.getElementById("explanation").innerText = explanation;

    displayPlayerListResults(scores, answers);
    updateHostDisplay();
});

socket.on("gameEnded", ({ logs }) => {
    updateDisplay("endGame");
    displayPlayerListEndGame();
    resetParty();
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
    displayPlayerListWaiting();
    if (party.playerHostName != host) {
        party.playerHostName = host;
        if (party.playerHostName === myself.name){
            updateHostDisplay();
            create("Vous êtes devenu le nouvel hôte !", "info");
        }
    }
});

updateDisplay("home");