// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = (canvas.width = 800);
const canvasHeight = (canvas.height = 400);

// Game Variables
let gameRunning = false;
let gameOver = false;
let theme = null;
let player, obstacles, score, highScore, speed;
let isPaused = false;
let backgroundImage = new Image();
let backgroundX = 0;

// Define Themes with Image Paths
const themes = {
  space: {
    playerImage: "images/spaceship.png",
    obstacleImage: "images/meteor.png",
    backgroundImage: "https://img.freepik.com/free-vector/creative-watercolor-galaxy-background_79603-1388.jpg",
  },
  ocean: {
    playerImage: "images/fish.png",
    obstacleImage: "images/seaweed.png",
    backgroundImage: "https://www.patternpictures.com/wp-content/uploads/Intense-blue-ocean-background-water-render-patternpictures-5522-1400x930.jpg",
  },
  forest: {
    playerImage: "images/squirrel.png",
    obstacleImage: "images/log.png",
    backgroundImage: "https://images.pond5.com/forest-trees-background-glade-thicket-illustration-157953878_iconl_wide_nowm.jpeg",
  },
};

// Load Images for Player, Obstacles, and Background
let playerImage = new Image();
let obstacleImage = new Image();

function loadThemeImages(selectedTheme) {
  playerImage.src = themes[selectedTheme].playerImage;
  obstacleImage.src = themes[selectedTheme].obstacleImage;
  backgroundImage.src = themes[selectedTheme].backgroundImage;
}

// Draw the Player with the Image
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Draw Obstacles with Images
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(
      obstacleImage,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  });
}

// Draw Dynamic Background
function drawBackground() {
  ctx.drawImage(backgroundImage, backgroundX, 0, canvasWidth, canvasHeight);
  ctx.drawImage(
    backgroundImage,
    backgroundX + canvasWidth,
    0,
    canvasWidth,
    canvasHeight
  );
  backgroundX -= speed * 0.5; // Slow scroll speed for background
  if (backgroundX <= -canvasWidth) {
    backgroundX = 0; // Reset the background position
  }
}

// Update startGame to Load Theme Images
function startGame(selectedTheme) {
  theme = themes[selectedTheme];
  loadThemeImages(selectedTheme);
  resetGame();
  gameRunning = true;
  gameLoop();
}

function resetGame() {
  gameOver = false;
  player = {
    x: 100,
    y: canvasHeight - 50,
    width: 60,
    height: 60,
    dy: 0,
    jumpPower: -15,
    gravity: 0.6,
    onGround: false,
  };
  obstacles = [];
  score = 0;
  speed = 5;

  // Reset background position
  backgroundX = 0;
}

function updateObstacles() {
  if (Math.random() < 0.02) {
    obstacles.push({
      x: canvasWidth,
      y: canvasHeight - 50,
      width: 40,
      height: 40,
    });
  }

  obstacles.forEach((obstacle, index) => {
    obstacle.x -= speed;
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
      score++;
    }

    // Collision Detection
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      endGame();
    }
  });
}

function movePlayer() {
  player.dy += player.gravity;
  player.y += player.dy;

  // Prevent player from falling below the ground
  if (player.y + player.height >= canvasHeight) {
    player.y = canvasHeight - player.height;
    player.dy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }
}

function endGame() {
  gameOver = true;
  gameRunning = false;

  // Update High Score
  if (score > highScore) {
    highScore = score;
  }

  // Display End Screen
  drawEndScreen();
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`High Score: ${highScore}`, 20, 60);
}

function drawEndScreen() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvasWidth / 2, canvasHeight / 2 - 40);

  ctx.font = "20px Arial";
  ctx.fillText(`Your Score: ${score}`, canvasWidth / 2, canvasHeight / 2);
  ctx.fillText(`High Score: ${highScore}`, canvasWidth / 2, canvasHeight / 2 + 30);
  ctx.fillText("Press 'R' to Restart", canvasWidth / 2, canvasHeight / 2 + 60);
  ctx.fillText("Press 'T' to Change Theme", canvasWidth / 2, canvasHeight / 2 + 90);
}

// Show Pause Screen
function showPauseScreen() {
  const pauseOverlay = document.createElement("div");
  pauseOverlay.id = "pause-screen";
  pauseOverlay.innerText = "Game Paused\nPress 'P' to Resume";
  pauseOverlay.style.position = "fixed";
  pauseOverlay.style.top = "50%";
  pauseOverlay.style.left = "50%";
  pauseOverlay.style.transform = "translate(-50%, -50%)";
  pauseOverlay.style.background = "rgba(0, 0, 0, 0.8)";
  pauseOverlay.style.color = "white";
  pauseOverlay.style.padding = "20px";
  pauseOverlay.style.textAlign = "center";
  pauseOverlay.style.zIndex = "1000";
  document.body.appendChild(pauseOverlay);
}

function hidePauseScreen() {
  const pauseOverlay = document.getElementById("pause-screen");
  if (pauseOverlay) {
    document.body.removeChild(pauseOverlay);
  }
}

// Handle Key Presses
document.addEventListener("keydown", (event) => {
  if (event.key === " " && player.onGround && !gameOver) {
    player.dy = player.jumpPower;
  } else if (event.key === "r" && gameOver) {
    resetGame();
    gameRunning = true;
    gameLoop();
  } else if (event.key === "t") {
    gameRunning = false;
    gameOver = false;
    showThemeSelection();
  } else if (event.key === "p") {
    isPaused = !isPaused; // Toggle pause
    if (isPaused) {
      showPauseScreen();
    } else {
      hidePauseScreen();
      gameLoop(); // Resume the game loop
    }
  }
});

// Game Loop
function gameLoop() {
  if (isPaused) return;
  if (!gameRunning) return;

  // Clear canvas before rendering
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackground();
  drawPlayer();
  drawObstacles();
  drawScore();
  movePlayer();
  updateObstacles();

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// Theme Selection Menu
function showThemeSelection() {
  const themeSelectionDiv = document.createElement("div");
  themeSelectionDiv.id = "themeSelection";
  themeSelectionDiv.style.textAlign = "center";
  themeSelectionDiv.style.marginTop = "20px";

  const title = document.createElement("h1");
  title.innerText = "Choose Your Theme";
  themeSelectionDiv.appendChild(title);

  Object.keys(themes).forEach((themeKey) => {
    const button = document.createElement("button");
    button.innerText =
      themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
    button.style.margin = "10px";
    button.style.padding = "10px 20px";
    button.style.fontSize = "16px";
    button.addEventListener("click", () => {
      themeSelectionDiv.remove();
      startGame(themeKey);
    });
    themeSelectionDiv.appendChild(button);
  });

  document.body.appendChild(themeSelectionDiv);
}

// Initialize High Score
highScore = 0;

// Initialize Game
showThemeSelection();











