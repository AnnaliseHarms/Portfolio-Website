// ===== Minesweeper =====

const MS_ROWS = 16;
const MS_COLS = 16;
const MS_MINES = 40;

let msGrid = [];
let msFirstClick = true;
let msRunning = true;
let msRevealedSafeCount = 0;

function msInitGrid() {
    msGrid = [];
    for (let r = 0; r < MS_ROWS; r++) {
        const row = [];
        for (let c = 0; c < MS_COLS; c++) {
            row.push({ mine: false, count: 0, revealed: false, flagged: false });
        }
        msGrid.push(row);
    }
    msFirstClick = true;
    msRunning = true;
    msRevealedSafeCount = 0;
}

function msPlaceMines(firstRow, firstCol) {
    let placed = 0;
    while (placed < MS_MINES) {
        const r = Math.floor(Math.random() * MS_ROWS);
        const c = Math.floor(Math.random() * MS_COLS);

        if (Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1) continue;
        if (msGrid[r][c].mine) continue;

        msGrid[r][c].mine = true;
        placed++;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < MS_ROWS && nc >= 0 && nc < MS_COLS && !msGrid[nr][nc].mine) {
                    msGrid[nr][nc].count++;
                }
            }
        }
    }
}

function msRenderGrid() {
    const gridEl = document.getElementById("ms-grid");
    gridEl.innerHTML = "";

    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            const cellEl = document.createElement("div");
            cellEl.className = "ms-cell";
            cellEl.dataset.row = r;
            cellEl.dataset.col = c;

            cellEl.addEventListener("click", msHandleLeftClick);
            cellEl.addEventListener("contextmenu", msHandleRightClick);

            gridEl.appendChild(cellEl);
        }
    }
}

function msGetCellElement(r, c) {
    return document.querySelector('.ms-cell[data-row="' + r + '"][data-col="' + c + '"]');
}

function msUpdateMineCounter() {
    let flaggedCount = 0;
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            if (msGrid[r][c].flagged) flaggedCount++;
        }
    }
    document.getElementById("ms-mine-count").textContent = "Mines left: " + (MS_MINES - flaggedCount);
}

function msHandleLeftClick(e) {
    if (!msRunning) return;

    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    const cell = msGrid[r][c];

    if (cell.revealed || cell.flagged) return;

    if (msFirstClick) {
        msPlaceMines(r, c);
        msFirstClick = false;
    }

    msRevealCell(r, c);
}

function msHandleRightClick(e) {
    e.preventDefault();
    if (!msRunning) return;

    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    const cell = msGrid[r][c];

    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    const cellEl = msGetCellElement(r, c);

    if (cell.flagged) {
        cellEl.textContent = "🚩";
    } else {
        cellEl.textContent = "";
    }

    msUpdateMineCounter();
}

function msRevealCell(r, c) {
    if (r < 0 || r >= MS_ROWS || c < 0 || c >= MS_COLS) return;

    const cell = msGrid[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    const cellEl = msGetCellElement(r, c);
    cellEl.classList.add("revealed");

    if (cell.mine) {
        cellEl.classList.add("mine");
        cellEl.textContent = "💣";
        msRunning = false;
        msRevealAllMines();
        document.getElementById("ms-message").textContent = "You Lost!";
        return;
    }

    msRevealedSafeCount++;

    if (cell.count > 0) {
        cellEl.textContent = cell.count;
        cellEl.classList.add("ms-num-" + cell.count);
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                msRevealCell(r + dr, c + dc);
            }
        }
    }

    msCheckWin();
}

function msRevealAllMines() {
    for (let r = 0; r < MS_ROWS; r++) {
        for (let c = 0; c < MS_COLS; c++) {
            if (msGrid[r][c].mine) {
                const cellEl = msGetCellElement(r, c);
                cellEl.classList.add("revealed", "mine");
                cellEl.textContent = "💣";
            }
        }
    }
}

function msCheckWin() {
    const totalSafeCells = MS_ROWS * MS_COLS - MS_MINES;
    if (msRevealedSafeCount === totalSafeCells) {
        msRunning = false;
        document.getElementById("ms-message").textContent = "You Win!";
    }
}

function msStartGame() {
    msInitGrid();
    msRenderGrid();
    msUpdateMineCounter();
    document.getElementById("ms-message").textContent = "";
}

const msRestartBtn = document.getElementById("ms-restart-btn");
if (msRestartBtn) {
    msRestartBtn.addEventListener("click", msStartGame);
}

if (document.getElementById("ms-grid")) {
    msStartGame();
}