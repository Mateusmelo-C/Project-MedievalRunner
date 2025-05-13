const menuInicial    = document.getElementById('menuInicial');
const botaoJogar     = document.getElementById('botaoJogar');
const gameContainer  = document.getElementById('gameContainer');
const canvas         = document.getElementById('gameCanvas');
const ctx            = canvas.getContext('2d');
const botoesFim      = document.getElementById('botoesFimDeJogo');
const botaoReiniciar = document.getElementById('botaoReiniciar');
const botaoMenu      = document.getElementById('botaoMenu');

let jogoIniciado  = false;  
let jogoRodando   = false;  
let jogoGameOver  = false;
let score         = 0;

const fundoImg     = new Image();
fundoImg.src       = 'Fundo-jogo-interativo.gif';  
let fundoX         = 0;
const fundoSpeed   = 3;

const player = {
  x:       200,
  y:       canvas.height - 80,
  width:   70,
  height:  100,
  vy:      0,
  gravity: 1,
  jumping: false,
  state:   'idle',
  sprites: {
    idle: new Image(),
    run:  new Image(),
    jump: new Image(),
    fall: new Image()
  }
};
player.sprites.idle.src = 'personagem (1)/personagem/parado.gif';
player.sprites.run.src  = 'personagem (1)/correndo.gif';
player.sprites.jump.src = 'personagem (1)/personagem/pulo.gif';
player.sprites.fall.src = 'personagem (1)/caindo.gif';


const obsImg     = new Image();
obsImg.src       = 'rocha.png'; 
let obstacles    = [];
const obsSpeed   = 6;
const obsSpawnMS = 2000;
let ultimoObs    = 0;


document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (!jogoIniciado) {
      jogoIniciado = true;
      jogoRodando  = true;
      player.state = 'run';
      loop();
    } else if (!player.jumping && !jogoGameOver) {
      player.vy       = -18;
      player.jumping  = true;
      player.state    = 'jump';
    }
  }
});

botaoJogar.addEventListener('click', () => {
  menuInicial.style.display   = 'none';
  gameContainer.style.display = 'block';
  drawStartScreen();
});
botaoReiniciar.addEventListener('click', () => location.reload());
botaoMenu.addEventListener('click',     () => location.reload());

function drawStartScreen() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle   = '#fff';
  ctx.font        = "20px 'Press Start 2P'";
  ctx.textAlign   = 'center';
  ctx.fillText('Pressione espaço para começar', canvas.width/2, canvas.height/2);
}


function loop(timestamp) {
  if (!jogoRodando) return;
  update(timestamp);
  draw();
  requestAnimationFrame(loop);
}

function update(ts) {
  if (jogoGameOver) return;
  fundoX -= fundoSpeed;
  if (fundoX <= -canvas.width) fundoX = 0;

  player.y += player.vy;
  player.vy += player.gravity;

  if (player.jumping && player.vy > 0 && player.state !== 'fall') {
    player.state = 'fall';
  }
  if (player.y > canvas.height - player.height) {
    player.y       = canvas.height - player.height;
    player.vy      = 0;
    player.jumping = false;
    player.state   = 'run';
  }

  if (ts - ultimoObs > obsSpawnMS) {
    const h = Math.random() * 40 + 40;
    obstacles.push({
      x:      canvas.width,
      y:      canvas.height - h,
      width:  30,
      height: h
    });
    ultimoObs = ts;
  }

  for (let i = obstacles.length-1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= obsSpeed;
    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      jogoGameOver = true;
      jogoRodando  = false;
      break;
    }
    if (o.x + o.width < 0) obstacles.splice(i,1);
  }

  score++;
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.drawImage(fundoImg, fundoX, 0, canvas.width, canvas.height);
  ctx.drawImage(fundoImg, fundoX + canvas.width, 0, canvas.width, canvas.height);

  for (let o of obstacles) {
    ctx.drawImage(obsImg, o.x, o.y, o.width, o.height);
  }

  ctx.drawImage(
    player.sprites[player.state],
    player.x, player.y, player.width, player.height
  );

  ctx.fillStyle = '#fff';
  ctx.font      = "18px 'Press Start 2P'";
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 10, 24);

  if (jogoGameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'red';
    ctx.font      = "28px 'Press Start 2P'";
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 20);
    botoesFim.style.display = 'flex';
  }
}