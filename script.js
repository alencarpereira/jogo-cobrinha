const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const box = 20;

let snake = [{ x: 10 * box, y: 10 * box }];
let direction = "right";
let food = gerarComida();
let score = 0;
let jogadorNome = "";
let velocidade = 300;
let game;

// Sons
const somFundo = document.getElementById("somFundo");
const somComer = document.getElementById("somComer");
const somGameOver = document.getElementById("somGameOver");

// Controles
const btnIniciar = document.getElementById("btnIniciar");
const pontuacaoTexto = document.getElementById("pontuacao");
const inputNome = document.getElementById("inputNome");
const controles = document.querySelector(".controles");

// Eventos
document.addEventListener("keydown", updateDirection);
document.getElementById("btnCima").onclick = () => direction !== "down" && (direction = "up");
document.getElementById("btnBaixo").onclick = () => direction !== "up" && (direction = "down");
document.getElementById("btnEsquerda").onclick = () => direction !== "right" && (direction = "left");
document.getElementById("btnDireita").onclick = () => direction !== "left" && (direction = "right");

// Ativa botão iniciar
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
    direction = "right";
    score = 0;
    pontuacaoTexto.textContent = "Pontuação: 0";
    snake = [{ x: 10 * box, y: 10 * box }];
    food = gerarComida();

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
        if (i === 0) {
            // Cabeça com cara de cobra
            context.fillStyle = "limegreen";
            context.beginPath();
            context.arc(segment.x + box / 2, segment.y + box / 2, box / 2, 0, Math.PI * 2);
            context.fill();

            // Olhos
            context.fillStyle = "white";
            const eyeOffsetX = direction === "left" ? -5 : direction === "right" ? 5 : 0;
            const eyeOffsetY = direction === "up" ? -5 : direction === "down" ? 5 : 0;

            context.beginPath();
            context.arc(segment.x + box / 2 - 4 + eyeOffsetX, segment.y + box / 2 - 4 + eyeOffsetY, 3, 0, Math.PI * 2);
            context.arc(segment.x + box / 2 + 4 + eyeOffsetX, segment.y + box / 2 - 4 + eyeOffsetY, 3, 0, Math.PI * 2);
            context.fill();

            // Pupilas
            context.fillStyle = "black";
            context.beginPath();
            context.arc(segment.x + box / 2 - 4 + eyeOffsetX, segment.y + box / 2 - 4 + eyeOffsetY, 1.5, 0, Math.PI * 2);
            context.arc(segment.x + box / 2 + 4 + eyeOffsetX, segment.y + box / 2 - 4 + eyeOffsetY, 1.5, 0, Math.PI * 2);
            context.fill();

            // Língua
            context.strokeStyle = "red";
            context.lineWidth = 2;
            context.beginPath();
            const tongueX = segment.x + box / 2 + (direction === "right" ? 10 : direction === "left" ? -10 : 0);
            const tongueY = segment.y + box / 2 + (direction === "down" ? 10 : direction === "up" ? -10 : 0);
            context.moveTo(segment.x + box / 2, segment.y + box / 2);
            context.lineTo(tongueX, tongueY);
            context.stroke();

        } else {
            // Corpo - bolinhas parecendo serpente
            context.fillStyle = "green";
            context.beginPath();
            context.arc(segment.x + box / 2, segment.y + box / 2, box / 2 - 2, 0, Math.PI * 2);
            context.fill();
        }
    });
}


function drawFood() {
    context.fillStyle = "red";
    context.beginPath();
    context.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, Math.PI * 2);
    context.fill();

    // Cabinho da maçã
    context.strokeStyle = "brown";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(food.x + box / 2, food.y + box / 2 - (box / 2 - 2));
    context.lineTo(food.x + box / 2, food.y + box / 2 - (box / 2 + 3));
    context.stroke();
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

    fetch("https://snake-backend-1.onrender.com/api/scores", {
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

    fetch("https://snake-backend-1.onrender.com/api/scores/top5")
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

// Carregar ranking na abertura
window.addEventListener("load", carregarRanking);















