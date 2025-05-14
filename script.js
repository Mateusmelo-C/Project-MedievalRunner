const menuInicial = document.getElementById('menuInicial');
const botaoJogar = document.getElementById('botaoJogar');
const gameContainer = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerSprite   = document.getElementById('playerSprite');
const botoesFim = document.getElementById('botoesFimDeJogo');
const botaoReiniciar = document.getElementById('botaoReiniciar');
const botaoMenu = document.getElementById('botaoMenu');
const margemColisao = 10;

let jogoIniciado = false;  
let jogoRodando = false;  
let jogoGameOver = false;
let score = 0;

let musicaDeFundo = new Audio("e-somjogo.mp3")
let musicaFimDeJogo = new Audio("e-somfimdejogo.mp3")
let musicaDoPulo = new Audio("e-somdopulo.mp3")
let musicaDeReinicio = new Audio("e-somdereinicio.mp3")

musicaDeFundo.loop = true;
musicaDeFundo.volume = 0.3;

const fundoImg = new Image();
fundoImg.src = 'Fundo-jogo-interativo.png';  
let fundoX = 0;
const fundoSpeed = 5;

const obsImg = new Image(); 
obsImg.src = 'rocha.png'; 
let obstacles = []; 
const obsSpeed = 12; 
const obsSpawnMS = 1500;
let ultimoObs = 0;

const stateToGif = {
  idle: 'parado.gif', 
  run:  'correndo.gif', 
  jump: 'pulo.gif', 
  fall: 'caindo.gif' 
};

let player = {
  x: 200, 
  y: canvas.height - 100, 
  width: 70, 
  height: 100, 
  vy: 0, 
  gravity: 1, 
  jumping: false, 
  state: 'run' 
};

let spriteAtual = '';

function updatePlayerSprite() {
  const novoSrc = stateToGif[player.state]; 
  if (!playerSprite.src.includes(novoSrc)) {
    playerSprite.src = novoSrc;
    spriteAtual = novoSrc;
  }

  playerSprite.style.left = `${player.x}px`;
  playerSprite.style.top  = `${player.y}px`;
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!jogoIniciado) {
      jogoIniciado = true;
      jogoRodando = true;
      player.state = 'run';
      loop();
    } else if (!player.jumping && !jogoGameOver) {
      player.vy = -19;
      player.jumping = true;
      player.state = 'jump';
      musicaDoPulo.play();
      musicaDoPulo.currentTime = 0;
      musicaDoPulo.volume = 0.5;
    }
  }
});

botaoJogar.addEventListener('click', () => {
  menuInicial.style.display   = 'none';
  gameContainer.style.display = 'block';
  musicaDeFundo.play(),
  musicaDeFundo.currentTime = 0;
  startScreenLoop();
});

botaoReiniciar.addEventListener('click', () => {
  
  musicaDeReinicio.play();
  musicaDeReinicio.currentTime = 0;
  musicaDeReinicio.volume = 0.7;

  jogoIniciado = false;
  jogoRodando = false;
  jogoGameOver = false;
  score = 0;
  obstacles = [];
  player.y = canvas.height - player.height;
  player.vy = 0;
  player.jumping = false;
  player.state = 'run';
  
  botoesFim.style.display = 'none';

  musicaFimDeJogo.pause();
  musicaFimDeJogo.currentTime = 0;
  musicaDeFundo.currentTime = 0;
  musicaDeFundo.play();

  startScreenLoop();
});

botaoMenu.addEventListener('click', () => location.reload());

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fundoImg, fundoX, 0, canvas.width, canvas.height);
  ctx.drawImage(fundoImg, fundoX + canvas.width, 0, canvas.width, canvas.height);
  obstacles.forEach(o => ctx.drawImage(obsImg, o.x, o.y, o.width, o.height));
}

function drawStartScreen() {
  drawCanvas();
  player.state = 'run'
  updatePlayerSprite();
  ctx.fillStyle = '#fff';
  ctx.font = "20px 'Press Start 2P'";
  ctx.textAlign = 'center';
  ctx.fillText('Pressione espaço para começar', canvas.width/2, canvas.height/2);
}

function startScreenLoop() {
  if (jogoIniciado) return;
  fundoX -= fundoSpeed;
  if (fundoX <= -canvas.width) fundoX = 0;
  drawStartScreen(); 
  requestAnimationFrame(startScreenLoop);
}

function loop(ts) {
  if (!jogoRodando) return; 
  update(ts); 
  draw(); 
  requestAnimationFrame(loop); 
}

function update(ts) {
  if (jogoGameOver) return;

  fundoX -= fundoSpeed;
  if (fundoX <= -canvas.width) fundoX = 0;

  player.y += player.vy; 
  player.vy += player.gravity; 

  if (player.jumping && player.vy > 0) {
    player.state = 'fall';
  }

  if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
    player.vy = 0; 
    player.jumping = false; 
    player.state = 'run'; 
  }

  
  if (ts - ultimoObs > obsSpawnMS) { 
    const h = Math.random() * 65 + 85; 
    obstacles.push({
      x: canvas.width,
      y: canvas.height - h,
      width: 70,
      height: h 
    });
    ultimoObs = ts; 
  }

  obstacles = obstacles.filter(o => {
    o.x -= obsSpeed;

  if (
    player.x < o.x + o.width - margemColisao &&
    player.x + player.width > o.x + margemColisao &&
    player.y < o.y + o.height - margemColisao &&
    player.y + player.height > o.y + margemColisao
    ) {
    jogoGameOver = true;
    jogoRodando = false;
  }
    

    return (o.x + o.width > 0); 
  });

  if (!jogoGameOver) score++;
  updatePlayerSprite(); 

}

function draw() {
  drawCanvas();
  updatePlayerSprite();
  ctx.fillStyle = '#fff';
  ctx.font = "18px 'Press Start 2P'";
  ctx.textAlign = 'left'; 
  ctx.fillText(`Score: ${score}`, 10, 24); 

  if (jogoGameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    botoesFim.style.display = 'flex'; 
    
    musicaDeFundo.currentTime = 0;
    musicaDeFundo.pause();
    musicaFimDeJogo.play();
    musicaFimDeJogo.currentTime = 0;
    musicaFimDeJogo.volume = 0.7;

  }
}