<script>
    export let back;
    export let changeAvatar;
    export let joinGame;
</script>

<div id="setup" class="setup-container">
    <img src="img/CetaitQuandLogo.png" alt="Logo C'était quand" class="logo-watermark">
    <button class="avatar-nav-btn back-button" on:click={() => back('setup')}><img src="img/ArrowButtonLeft.png" class="leftarrowbtn-img"/></button>
    <div class="card">
        <h2 class="card-title">CHOISIS UN AVATAR <br /> ET UN SURNOM</h2>
        <div class="avatar-selection">
        <button class="avatar-nav-btn" on:click={() => changeAvatar(-1)}><img src="img/ArrowButtonLeft.png" class="leftarrowbtn-img"/></button>
        <img id="setup-avatar" src="img/Avatar1.png" alt="Avatar" class="avatar-img">
        <button class="avatar-nav-btn" on:click={() => changeAvatar(1)}><img src="img/ArrowButtonRight.png" class="rightarrowbtn-img"/></button>
        </div>
        <input id="setup-playerInput" type="text" class="nickname-input" placeholder="SURNOM" value="">
        <div class="join-code-container">
        <input id="setup-code" type="text" class="code-input" placeholder="CODE" value=""><button id="setup-next" class="join-button" on:click={joinGame}>REJOINDRE</button>
        </div>
    </div>
</div>