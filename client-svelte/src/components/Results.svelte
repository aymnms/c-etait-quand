<script>
    export let nextRound;
</script>

<div id="results" class="game-page">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo-watermark">
    <div class="card-front">
        <div class="card-header">
        <h1>RÉSULTATS</h1>
        </div>
        <div class="card-inner results-content">
        <div class="explanation-box">
            <h2 id="solution" class="final-date"></h2>
            <p id="explanation"></p>
        </div>
        <div id="player-cards" class="players-row"></div>
        </div>
    </div>
    <div class="card-footer">
        <button id="next" class="validate-button" on:click={nextRound}>Question suivante</button>
    </div>
</div>