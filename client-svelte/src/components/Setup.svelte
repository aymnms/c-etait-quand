<script>
    export let back;
    export let myself;
    export let avatars;
    export let setupCreatorMod;
    export let createToast;

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
    
</script>

<div id="setup" class="setup-container">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo-watermark">
    <button class="avatar-nav-btn back-button" on:click={() => back('setup')}><img src="img/ArrowButtonLeft.png" class="leftarrowbtn-img", alt="back button"/></button>
    <div class="card">
        <h2 class="card-title">CHOISIS UN AVATAR <br /> ET UN SURNOM</h2>
        <div class="avatar-selection">
        <button class="avatar-nav-btn" on:click={() => changeAvatar(-1)}><img src="img/ArrowButtonLeft.png" class="leftarrowbtn-img" alt="previous switch avatar"/></button>
        <img id="setup-avatar" src="img/Avatar1.png" alt="Avatar" class="avatar-img">
        <button class="avatar-nav-btn" on:click={() => changeAvatar(1)}><img src="img/ArrowButtonRight.png" class="rightarrowbtn-img" alt="next switch avatar"/></button>
        </div>
        <input id="setup-playerInput" type="text" class="nickname-input" placeholder="SURNOM" value="">
        <div class="join-code-container">
        {#if !setupCreatorMod}
            <input id="setup-code" type="text" class="code-input" placeholder="CODE" value="">
        {/if}
        <button id="setup-next" class="join-button" on:click={joinGame}>{#if setupCreatorMod}CRÉER{:else}REJOINDRE{/if}</button>
        </div>
    </div>
</div>