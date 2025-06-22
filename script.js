let canvas = document.getElementById("game");
let context = canvas.getContext("2d");
let box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "right";
let food = gerarComida();
let score = 0;
let jogadorNome = "";
let velocidade = 400;
let game;

const somFundo = document.getElementById("somFundo");
const somComer = document.getElementById("somComer");
const somGameOver = document.getElementById("somGameOver");

const btnIniciar = document.getElementById("btnIniciar");
const pontuacaoTexto = document.getElementById("pontuacao");
const inputNome = document.getElementById("inputNome");
const controles = document.querySelector(".controles");

// Controles teclado e mobile
document.addEventListener("keydown", updateDirection);
document.getElementById("btnCima").onclick = () => direction !== "down" && (direction = "up");
document.getElementById("btnBaixo").onclick = () => direction !== "up" && (direction = "down");
document.getElementById("btnEsquerda").onclick = () => direction !== "right" && (direction = "left");
document.getElementById("btnDireita").onclick = () => direction !== "left" && (direction = "right");

// Ativa botão iniciar após digitar nome
inputNome.addEventListener("input", () => {
    btnIniciar.disabled = inputNome.value.trim() === "";
});

btnIniciar.addEventListener("click", () => {
    jogadorNome = inputNome.value.trim();
    if (jogadorNome === "") return;

    inputNome.style.display = "none";
    btnIniciar.style.display = "none";
    canvas.style.display = "block";
    pontuacaoTexto.style.display = "block";
    somFundo.play();

    iniciarJogo();
});

function iniciarJogo() {
    jogadorNome = inputNome.value.trim(); // Garante que o nome seja atualizado sempre

    // Reinicia estado do jogo
    direction = "right";
    score = 0;
    pontuacaoTexto.textContent = "Pontuação: 0";
    snake = [{ x: 10 * box, y: 10 * box }];
    food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
    };

    controles.style.display = window.innerWidth <= 800 ? "flex" : "none";

    if (game) clearInterval(game);
    game = setInterval(startGame, velocidade);
}


function updateDirection(event) {
    if (event.keyCode == 37 && direction !== "right") direction = "left";
    if (event.keyCode == 38 && direction !== "down") direction = "up";
    if (event.keyCode == 39 && direction !== "left") direction = "right";
    if (event.keyCode == 40 && direction !== "up") direction = "down";
}

function drawBackground() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, 400, 400);
}

function drawSnake() {
    snake.forEach((segment, i) => {
        context.fillStyle = i === 0 ? "lime" : "green";
        context.fillRect(segment.x, segment.y, box, box);
    });
}

function drawFood() {
    context.fillStyle = "red";
    context.fillRect(food.x, food.y, box, box);
}

function gerarComida() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
    };
}

function startGame() {
    if (
        snake[0].x < 0 || snake[0].x >= 20 * box ||
        snake[0].y < 0 || snake[0].y >= 20 * box
    ) return gameOver();

    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            return gameOver();
        }
    }

    drawBackground();
    drawSnake();
    drawFood();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "right") snakeX += box;
    if (direction == "left") snakeX -= box;
    if (direction == "up") snakeY -= box;
    if (direction == "down") snakeY += box;

    if (snakeX == food.x && snakeY == food.y) {
        score++;
        pontuacaoTexto.textContent = "Pontuação: " + score;
        somComer.play();
        food = gerarComida();
    } else {
        snake.pop();
    }

    snake.unshift({ x: snakeX, y: snakeY });
}

function gameOver() {
    clearInterval(game);
    somFundo.pause();
    somGameOver.play();

    const pontuacaoFinal = score;

    alert(`Game Over, ${jogadorNome}! Pontuação final: ${pontuacaoFinal}`);

    // Envia dados para o backend
    fetch("https://snake-backend-1.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: jogadorNome, pontuacao: pontuacaoFinal }),
    })
        .then(res => res.json())
        .then(data => {
            console.log("Pontuação salva!", data);
            carregarRanking();
        })
        .catch(err => console.error("Erro ao salvar pontuação:", err));

    // Resetar visual
    canvas.style.display = "none";
    pontuacaoTexto.style.display = "none";
    controles.style.display = "none";

    inputNome.style.display = "inline";
    btnIniciar.style.display = "inline";
    btnIniciar.disabled = inputNome.value.trim() === "";
}


function carregarRanking() {
    const rankingLista = document.getElementById("ranking");
    if (!rankingLista) return;

    rankingLista.innerHTML = "<li>Carregando ranking...</li>";

    fetch("https://snake-backend-1.onrender.com")
        .then(res => {
            if (!res.ok) throw new Error("Erro ao carregar ranking");
            return res.json();
        })
        .then(dados => {
            if (dados.length === 0) {
                rankingLista.innerHTML = "<li>Nenhuma pontuação ainda.</li>";
                return;
            }

            rankingLista.innerHTML = "";
            dados.forEach((item, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${item.nome} - ${item.pontuacao}`;
                rankingLista.appendChild(li);
            });
        })
        .catch(err => {
            rankingLista.innerHTML = `<li>Erro ao carregar ranking.</li>`;
            console.error(err);
        });
}

// Carrega ranking ao iniciar
window.addEventListener("load", carregarRanking);














