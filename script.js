const Player = document.getElementById("Player");
const obstacle = document.getElementById("obstacle");

function jump(Player) {
    if (!Player.classList.contains("jump") && !Player.classList.contains("dead")) {
        Player.classList.add("jump");
        setTimeout(() => Player.classList.remove("jump"), 500);


    }
}
document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "A") jump(Player);
});



function checkCollision(player, name) {

    let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));
    let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));

    if (obstacleLeft > 50 && obstacleLeft < 80 && playerBottom < 30) {
        player.style.backgroundColor = "gray";
        player.style.opacity = "0.5";
        player.classList.add("dead");
    }
}

let collisionCheck = setInterval(() => {
    checkCollision(Player, "Player 1");

}, 10);