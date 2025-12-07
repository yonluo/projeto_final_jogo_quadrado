document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    function showScreen(id) {
        screens.forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    const navHome = document.getElementById('nav-home');
    const navGame = document.getElementById('nav-game');
    const btnPlay = document.getElementById('btn-play');

    if (navHome) navHome.addEventListener('click', () => showScreen('screen-home'));
    if (navGame) navGame.addEventListener('click', () => showScreen('screen-game'));
    if (btnPlay) btnPlay.addEventListener('click', () => { window.location.href = 'game.html'; });
    document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => showScreen('screen-home')));

});