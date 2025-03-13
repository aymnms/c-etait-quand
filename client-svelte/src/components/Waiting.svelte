<script>
    export let back;
    export let nextRound;
</script>
  
<div id="waiting" class="room-container">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo-watermark">
    <button class="avatar-nav-btn back-button" on:click={() => back('waiting')}><img src="img/ArrowButtonLeft.png" class="leftarrowbtn-img"/></button>
    <div class="room-header-waiting">
        <h1 class="room-title">ROOM</h1>
        <main class="room-main-waiting">
        <div class="player-code-container">
            <h2 id="nbPlayer" class="player-count">JOUEUR 0/10</h2>
            <div class="code-box"></div>
            <h1 id="roomCode" class="code-title">CODE: </h1>
        </div>
        <div id="playerListWaiting" class="players-list"></div>
        </main>
    </div>
    <div id="startGame" class="room-footer">
        <button class="room-play-button" on:click={nextRound}>JOUER</button>
    </div>
</div>