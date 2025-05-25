const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const somComer = document.getElementById('somComer');
const somGameOver = document.getElementById('somGameOver');

// Ajusta volumes
somComer.volume = 0.5;
somGameOver.volume = 0.5;

const grid = 20;
const largura = canvas.width;
const altura = canvas.height;

let cobra = [
    { x: 8 * grid, y: 10 * grid },
    { x: 7 * grid, y: 10 * grid },
    { x: 6 * grid, y: 10 * grid },
];

let direcao = 'direita';
let comida = { x: 0, y: 0 };
let pontuacao = 0;

let velocidade = 200;
let jogo;

function gerarComida() {
    comida.x = Math.floor(Math.random() * (largura / grid)) * grid;
    comida.y = Math.floor(Math.random() * (altura / grid)) * grid;

    for (let parte of cobra) {
        if (parte.x === comida.x && parte.y === comida.y) {
            gerarComida();
            break;
        }
    }
}

function desenhar() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, largura, altura);

    ctx.fillStyle = 'red';
    ctx.fillRect(comida.x, comida.y, grid, grid);

    ctx.fillStyle = 'lime';
    for (let parte of cobra) {
        ctx.fillRect(parte.x, parte.y, grid, grid);
    }
}

function gameOver() {
    clearInterval(jogo);

    somGameOver.play().catch(e => {
        console.log('Erro ao tocar somGameOver:', e);
    });

    alert('Game Over! Sua pontuação: ' + pontuacao);

    document.getElementById('btnIniciar').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('pontuacao').style.display = 'none';
    document.getElementById('somFundo').pause();
    document.getElementById('somFundo').currentTime = 0;

}

function atualizar() {
    let cabeca = { ...cobra[0] };

    switch (direcao) {
        case 'direita': cabeca.x += grid; break;
        case 'esquerda': cabeca.x -= grid; break;
        case 'cima': cabeca.y -= grid; break;
        case 'baixo': cabeca.y += grid; break;
    }

    if (cabeca.x < 0 || cabeca.x >= largura || cabeca.y < 0 || cabeca.y >= altura) {
        gameOver();
        return;
    }

    for (let parte of cobra) {
        if (parte.x === cabeca.x && parte.y === cabeca.y) {
            gameOver();
            return;
        }
    }

    cobra.unshift(cabeca);

    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        pontuacao++;
        document.getElementById('pontuacao').textContent = 'Pontuação: ' + pontuacao;

        somComer.play().catch(e => {
            console.log('Erro ao tocar somComer:', e);
        });

        gerarComida();
    } else {
        cobra.pop();
    }
}

function gameLoop() {
    atualizar();
    desenhar();
}

function iniciarJogo() {
    if (jogo) clearInterval(jogo);

    // Desbloqueia o som para navegadores
    somComer.play().then(() => somComer.pause()).catch(() => { });
    somGameOver.play().then(() => somGameOver.pause()).catch(() => { });

    jogo = setInterval(gameLoop, velocidade);

    document.getElementById('somFundo').play();

}

function ajustarCanvas() {
    const tamanho = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.style.width = tamanho + 'px';
    canvas.style.height = tamanho + 'px';
}

window.addEventListener('keydown', e => {
    const tecla = e.key;
    if (tecla === 'ArrowUp' && direcao !== 'baixo') direcao = 'cima';
    else if (tecla === 'ArrowDown' && direcao !== 'cima') direcao = 'baixo';
    else if (tecla === 'ArrowLeft' && direcao !== 'direita') direcao = 'esquerda';
    else if (tecla === 'ArrowRight' && direcao !== 'esquerda') direcao = 'direita';
});

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, false);

window.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30 && direcao !== 'esquerda') direcao = 'direita';
        else if (diffX < -30 && direcao !== 'direita') direcao = 'esquerda';
    } else {
        if (diffY > 30 && direcao !== 'cima') direcao = 'baixo';
        else if (diffY < -30 && direcao !== 'baixo') direcao = 'cima';
    }
}, false);

document.getElementById('btnCima')?.addEventListener('click', () => {
    if (direcao !== 'baixo') direcao = 'cima';
});
document.getElementById('btnBaixo')?.addEventListener('click', () => {
    if (direcao !== 'cima') direcao = 'baixo';
});
document.getElementById('btnEsquerda')?.addEventListener('click', () => {
    if (direcao !== 'direita') direcao = 'esquerda';
});
document.getElementById('btnDireita')?.addEventListener('click', () => {
    if (direcao !== 'esquerda') direcao = 'direita';
});

function verificarOrientacao() {
    const orientacaoErrada = window.innerWidth > window.innerHeight;
    const mensagem = document.getElementById('mensagem-orientacao');
    const jogo = document.getElementById('game');
    const controles = document.querySelector('.controles');

    if (orientacaoErrada) {
        mensagem.style.display = 'block';
        jogo.style.display = 'none';
        if (controles) controles.style.display = 'none';
    } else {
        mensagem.style.display = 'none';
        jogo.style.display = 'block';
        if (controles) controles.style.display = '';
        ajustarCanvas();
    }
}
window.addEventListener('resize', verificarOrientacao);
window.addEventListener('load', verificarOrientacao);

document.getElementById('game').style.display = 'none';
document.getElementById('pontuacao').style.display = 'none';
document.getElementById('btnIniciar').style.display = 'block';

document.getElementById('btnIniciar').addEventListener('click', () => {
    document.getElementById('btnIniciar').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('pontuacao').style.display = 'block';

    cobra = [
        { x: 8 * grid, y: 10 * grid },
        { x: 7 * grid, y: 10 * grid },
        { x: 6 * grid, y: 10 * grid },
    ];
    direcao = 'direita';
    pontuacao = 0;
    document.getElementById('pontuacao').textContent = 'Pontuação: 0';

    ajustarCanvas();
    gerarComida();
    iniciarJogo();
});







