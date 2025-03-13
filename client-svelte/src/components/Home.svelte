<script>
    export let goToSetupPage;
</script>

<div id="home" class="container">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo">
    <div class="menubutton-container">
        <button class="play-button" on:click={() => goToSetupPage(true)}>Créer</button>
        <button class="play-button" on:click={() => goToSetupPage(false)}>Rejoindre</button>
    </div>
</div>