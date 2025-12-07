document.addEventListener('DOMContentLoaded', () => {
  const Player = document.getElementById("Player");

  const obstacle = document.getElementById("obstacle");

  function assignObstaclePoints() {
    if (!obstacle) return;
    const pts = Math.floor(Math.random() * 5) + 1;
    obstacle.dataset.points = String(pts);
    let badge = obstacle.querySelector('.obstacle-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'obstacle-badge'; obstacle.appendChild(badge); }
    badge.textContent = `+${pts}`;
  }
  if (obstacle) {
    obstacle.addEventListener('animationiteration', assignObstaclePoints);

    assignObstaclePoints();
    try { obstacle.style.animationPlayState = 'paused'; } catch (e) { }
  }

  function jumpCharacter(character) {
    if (!character) return;
    if (!character.classList.contains("jump") && !character.classList.contains("dead")) {
      character.classList.add("jump");
      setTimeout(() => character.classList.remove("jump"), 500);
      setTimeout(() => {
        try {
          const playerBottom = parseInt(window.getComputedStyle(character).getPropertyValue("bottom")) || 0;
          const obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left")) || 0;
          if (obstacleLeft > 50 && obstacleLeft < 80 && playerBottom >= 30) {
            addPointToActive();
          }
        } catch (e) { }
      }, 250);
    }
  }

  let gameStarted = false;
  let collisionCheck = null;
  let lastLossAmount = 0;
  let lastLoserName = null;

  document.addEventListener("keydown", (event) => {
    if (!gameStarted) return;
    const key = event.key;
    if (key === "a" || key === "A") jumpCharacter(Player);
  });

  const startBtnEl = document.getElementById('startButton');
  if (startBtnEl) startBtnEl.addEventListener('click', startGame);

  function checkCollision(player, name) {
    if (!player || !obstacle) return;
    let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom")) || 0;
    let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left")) || 0;
    if (obstacleLeft > 50 && obstacleLeft < 80 && playerBottom < 30 && !player.classList.contains('dead')) {
      console.log(`💣💣 ${name} game over!!💣💣`);
      try {
        if (typeof activePlayerIndex !== 'undefined' && activePlayerIndex !== null && players && players[activePlayerIndex]) {
          const currentScore = Number(players[activePlayerIndex].score || 0);
          let maxLoss = 5;
          if (currentScore >= 20) maxLoss = 10;
          else if (currentScore >= 10) maxLoss = 7;
          const loss = Math.floor(Math.random() * maxLoss) + 1;
          players[activePlayerIndex].score = Math.max(0, currentScore - loss);
          lastLossAmount = loss;
          lastLoserName = players[activePlayerIndex].name || 'Jogador';
          savePlayers(); renderPlayers();
          console.log(`-- Perdeu ${loss} pontos (aleatório, penalidade ${getQuality(currentScore).name})`);
        }
      } catch (e) { console.error(e); }
      player.style.backgroundColor = "gray";
      player.style.opacity = "0.5";
      player.classList.add("dead");
      showGameOver();
    }
  }


  function startGame() {
    if (gameStarted) return;
    if (!players || players.length === 0 || activePlayerIndex === null || activePlayerIndex === undefined) {
      try { alert('Crie e selecione um jogador antes de iniciar o jogo.'); } catch (e) { }
      return;
    }
    gameStarted = true;
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.style.display = 'none';
    try { if (obstacle) obstacle.style.animationPlayState = 'running'; } catch (e) { }
    collisionCheck = setInterval(() => { checkCollision(Player, "Player 1"); }, 50);
  }

  const playerForm = document.getElementById('playerForm');
  const playerNameInput = document.getElementById('playerName');
  const playerScoreInput = document.getElementById('playerScore');
  const playersListEl = document.getElementById('playersList');
  const playerClear = document.getElementById('playerClear');
  let players = JSON.parse(localStorage.getItem('players') || '[]');
  let editIndex = null;
  let activePlayerIndex = Number(localStorage.getItem('activePlayerIndex'));
  if (!Number.isFinite(activePlayerIndex)) activePlayerIndex = null;
  let scoreCooldownUntil = 0;

  function savePlayers() { localStorage.setItem('players', JSON.stringify(players)); }

  function renderPlayers() {
    if (!playersListEl) return;
    if (players.length === 0) { playersListEl.innerHTML = '<p style="color:#eaffff">Nenhum jogador salvo.</p>'; updateStartButtonState(); return; }
    playersListEl.innerHTML = '';
    players.forEach((p, idx) => {
      const item = document.createElement('div'); item.className = 'player-item';
      if (activePlayerIndex === idx) item.classList.add('selected');
      const left = document.createElement('div'); left.textContent = `${p.name} — ${p.score} pts`;
      if (activePlayerIndex === idx) {
        const badge = document.createElement('span'); badge.className = 'player-badge'; badge.textContent = 'Selecionado';
        left.appendChild(badge);
      }

      const quality = getQuality(p.score || 0);
      const qbadge = document.createElement('span'); qbadge.className = `player-quality ${quality.cls}`;
      qbadge.textContent = `${quality.name} +${quality.bonus}`;
      left.appendChild(qbadge);
      const actions = document.createElement('div'); actions.className = 'player-actions';
      const selectBtn = document.createElement('button'); selectBtn.textContent = 'Selecionar'; selectBtn.className = 'secondary';
      const editBtn = document.createElement('button'); editBtn.textContent = 'Editar'; editBtn.className = 'secondary';
      const delBtn = document.createElement('button'); delBtn.textContent = 'Apagar'; delBtn.className = 'secondary';
      selectBtn.addEventListener('click', () => { activePlayerIndex = idx; localStorage.setItem('activePlayerIndex', String(activePlayerIndex)); renderPlayers(); updateStartButtonState(); });
      editBtn.addEventListener('click', () => { playerNameInput.value = p.name; playerScoreInput.value = p.score; editIndex = idx; playerNameInput.focus(); });
      delBtn.addEventListener('click', () => { players.splice(idx, 1); savePlayers(); renderPlayers(); });
      actions.appendChild(selectBtn); actions.appendChild(editBtn); actions.appendChild(delBtn);
      item.appendChild(left); item.appendChild(actions);
      playersListEl.appendChild(item);
    });
  }

  if (playerForm) {
    playerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = playerNameInput.value.trim();
      const score = Number(playerScoreInput.value) || 0;
      if (!name) return;
      if (editIndex !== null) { players[editIndex] = { name, score }; editIndex = null; }
      else { players.push({ name, score }); }
      savePlayers();
      if (players.length === 1 && (activePlayerIndex === null || activePlayerIndex === undefined)) {
        activePlayerIndex = 0;
        localStorage.setItem('activePlayerIndex', String(activePlayerIndex));
      }
      renderPlayers();
      updateStartButtonState();
      playerForm.reset();
    });
    if (playerClear) playerClear.addEventListener('click', () => { players = []; editIndex = null; activePlayerIndex = null; savePlayers(); localStorage.removeItem('activePlayerIndex'); renderPlayers(); updateStartButtonState(); playerForm.reset(); });
  }

  renderPlayers();

  function updateStartButtonState() {
    if (!startBtnEl) return;
    const enabled = Array.isArray(players) && players.length > 0 && activePlayerIndex !== null && activePlayerIndex !== undefined;
    try {
      startBtnEl.disabled = !enabled;
      if (!enabled) startBtnEl.style.display = '';
    } catch (e) { }
  }

  updateStartButtonState();

  function addPointToActive() {
    const now = Date.now();
    if (now < scoreCooldownUntil) return;
    if (activePlayerIndex === null || activePlayerIndex === undefined) return;
    if (!players[activePlayerIndex]) return;

    const quality = getQuality(players[activePlayerIndex].score || 0);
    const bonus = Number(quality.bonus || 0);

    const obstaclePts = obstacle ? Number(obstacle.dataset.points || 1) : 1;
    const pointsToAdd = Math.max(1, obstaclePts + bonus);
    players[activePlayerIndex].score = Number(players[activePlayerIndex].score || 0) + pointsToAdd;
    savePlayers(); renderPlayers();
    scoreCooldownUntil = now + 700;
  }

  function showGameOver() {
    if (document.getElementById('gameOverOverlay')) return;

    try { if (collisionCheck) { clearInterval(collisionCheck); collisionCheck = null; } } catch (e) { }

    try { if (obstacle) obstacle.style.animationPlayState = 'paused'; } catch (e) { }

    const overlay = document.createElement('div');
    overlay.id = 'gameOverOverlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0,0,0,0.75)';
    overlay.style.zIndex = '9999';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '16px';

    const msg = document.createElement('div');
    msg.textContent = 'GAME OVER';
    msg.style.color = '#fff';
    msg.style.fontSize = '48px';
    msg.style.fontWeight = '700';
    msg.style.letterSpacing = '2px';
    msg.style.textAlign = 'center';

    if (lastLoserName && lastLossAmount && Number(lastLossAmount) > 0) {
      const info = document.createElement('div');
      info.textContent = `${lastLoserName} perdeu ${lastLossAmount} pontos`;
      info.style.color = '#ffdede';
      info.style.fontSize = '20px';
      info.style.fontWeight = '600';
      info.style.marginTop = '6px';
      overlay.appendChild(info);
    }

    const btn = document.createElement('button');
    btn.textContent = 'Novo Jogo';
    btn.style.padding = '10px 18px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '6px';
    btn.style.border = 'none';
    btn.style.background = '#0ea5b7';
    btn.style.color = '#012';
    btn.addEventListener('click', () => { location.reload(); });

    overlay.appendChild(msg);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  }

  function getQuality(score) {
    const s = Number(score || 0);
    if (s >= 20) return { name: 'Ouro', bonus: 2, cls: 'quality-gold' };
    if (s >= 10) return { name: 'Prata', bonus: 1, cls: 'quality-silver' };
    return { name: 'Bronze', bonus: 0, cls: 'quality-bronze' };
  }
});
