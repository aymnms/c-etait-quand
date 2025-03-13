<script>
    export let back;
</script>

<div id="endGame" class="room-container">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo-watermark">
    <div class="room-header-endgame">
        <h1 class="room-title">GAGNANTS</h1>
        <main class="room-main-endgame">
        <div id="playerListEndGame" class="players-list-endgame"></div>
        </main>
    </div>
    <div class="room-footer">
        <button class="room-play-button" on:click={() => back('endGame')}>REJOUER</button>
    </div>
</div>