const gridElement = document.getElementById("grid");

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const applySizeButton = document.getElementById("applySize");

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const stepButton = document.getElementById("step");
const rewindButton = document.getElementById("rewind");
const resetButton = document.getElementById("reset");

const speedInput = document.getElementById("speed");
const generationElement = document.getElementById("generation");

let width = 30;
let height = 20;

let grid = [];
let history = [];

let generation = 0;
let timer = null;


// 空のマス目を作る
function createEmptyGrid() {
    const newGrid = [];

    for (let y = 0; y < height; y++) {
        const row = [];

        for (let x = 0; x < width; x++) {
            row.push(false);
        }

        newGrid.push(row);
    }

    return newGrid;
}


// マス目を画面に表示する
function drawGrid() {
    gridElement.innerHTML = "";

    gridElement.style.gridTemplateColumns = `repeat(${width}, 20px)`;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            if (grid[y][x]) {
                cell.classList.add("alive");
            }

            cell.addEventListener("click", () => {
                grid[y][x] = !grid[y][x];
                drawGrid();
            });

            gridElement.appendChild(cell);
        }
    }
}


// 現在の状態を履歴に保存する
function saveHistory() {
    history.push({
        grid: grid.map(row => [...row]),
        generation: generation
    });

    // 履歴を増やしすぎない
    if (history.length > 100) {
        history.shift();
    }
}


// 周囲の生きたマスを数える
function countNeighbors(x, y) {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {

            if (dx === 0 && dy === 0) {
                continue;
            }

            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 &&
                nx < width &&
                ny >= 0 &&
                ny < height &&
                grid[ny][nx]
            ) {
                count++;
            }
        }
    }

    return count;
}


// 1世代進める
function nextGeneration() {
    saveHistory();

    const nextGrid = createEmptyGrid();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const neighbors = countNeighbors(x, y);

            if (grid[y][x]) {
                // 生きているマス
                nextGrid[y][x] =
                    neighbors === 2 || neighbors === 3;
            } else {
                // 死んでいるマス
                nextGrid[y][x] =
                    neighbors === 3;
            }
        }
    }

    grid = nextGrid;
    generation++;

    generationElement.textContent = generation;

    drawGrid();
}


// スタート
function startGame() {
    if (timer !== null) {
        return;
    }

    const speed = Number(speedInput.value);

    const interval = 1000 / speed;

    timer = setInterval(() => {
        nextGeneration();
    }, interval);
}


// ストップ
function stopGame() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
}


// 巻き戻し
function rewind() {
    if (history.length === 0) {
        return;
    }

    const previous = history.pop();

    grid = previous.grid;
    generation = previous.generation;

    generationElement.textContent = generation;

    drawGrid();
}


// リセット
function resetGame() {
    stopGame();

    grid = createEmptyGrid();

    history = [];

    generation = 0;

    generationElement.textContent = generation;

    drawGrid();
}


// マス数変更
function applySize() {
    stopGame();

    const newWidth = Number(widthInput.value);
    const newHeight = Number(heightInput.value);

    if (
        !Number.isInteger(newWidth) ||
        !Number.isInteger(newHeight) ||
        newWidth < 1 ||
        newHeight < 1
    ) {
        return;
    }

    width = newWidth;
    height = newHeight;

    history = [];
    generation = 0;

    generationElement.textContent = generation;

    grid = createEmptyGrid();

    drawGrid();
}


// ボタンに機能を設定
applySizeButton.addEventListener("click", applySize);

startButton.addEventListener("click", startGame);

stopButton.addEventListener("click", stopGame);

stepButton.addEventListener("click", () => {
    stopGame();
    nextGeneration();
});

rewindButton.addEventListener("click", () => {
    stopGame();
    rewind();
});

resetButton.addEventListener("click", resetGame);


// 最初のマス目を作る
grid = createEmptyGrid();

drawGrid();
