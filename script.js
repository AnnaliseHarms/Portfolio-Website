//behavior and interactivity

// for the experience section, toggle the job details when the job is clicked
const jobs = document.querySelectorAll(".job");

// Make the first job open by default when the page loads
if (jobs.length > 0) {
    jobs[0].classList.add("active");
}

jobs.forEach(function(job) {
    job.addEventListener("click", function() {
        const isAlreadyActive = job.classList.contains("active");

        // Close all jobs first
        jobs.forEach(function(otherJob) {
            otherJob.classList.remove("active");
        });

        // If the clicked job wasn't already open, open it
        if (!isAlreadyActive) {
            job.classList.add("active");
        }
    });
});

// for the copy email button, copy the email to clipboard and show "Copied!" for 2 seconds before restoring the copy symbol
const copyButton = document.getElementById("copy-email-btn");
const originalCopyLabel = copyButton.textContent; // the copy symbol
let copyResetTimer;

copyButton.addEventListener("click", function() {
    const email = document.getElementById("email-text").textContent;
    navigator.clipboard.writeText(email);

    copyButton.textContent = "Copied!";
    copyButton.classList.add("copied");

    // reset any pending restore so repeated clicks keep the full timer
    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(function() {
        copyButton.textContent = originalCopyLabel;
        copyButton.classList.remove("copied");
    }, 2000);
});

// ---- Projects: open a card into the full-view modal ----
const projectModal = document.getElementById("project-modal");

if (projectModal) {
    const projectCards = document.querySelectorAll(".project-card");
    const modalPanels = projectModal.querySelectorAll(".modal-panel");

    function openProject(projectId) {
        // Show only the panel matching the clicked card
        modalPanels.forEach(function(panel) {
            panel.classList.toggle("is-active", panel.dataset.project === projectId);
        });

        projectModal.hidden = false;
        document.body.style.overflow = "hidden"; // stop the page scrolling behind the modal
    }

    function closeProject() {
        projectModal.hidden = true;
        document.body.style.overflow = "";
    }

    projectCards.forEach(function(card) {
        card.addEventListener("click", function() {
            openProject(card.dataset.project);
        });

        // Keyboard support since the card is a div with role="button"
        card.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProject(card.dataset.project);
            }
        });

        // Preview videos: hold on a still frame, play while hovered
        const previewVideo = card.querySelector(".project-video");
        if (previewVideo) {
            // Force the browser to paint a still frame instead of a blank box
            previewVideo.addEventListener("loadeddata", function() {
                if (previewVideo.currentTime === 0) {
                    previewVideo.currentTime = 0.5;
                }
            });

            card.addEventListener("mouseenter", function() {
                previewVideo.play();
            });
            card.addEventListener("mouseleave", function() {
                previewVideo.pause();
                previewVideo.currentTime = 0.5; // back to the still frame
            });
        }
    });

    // Close on the X, the dark overlay, or the Escape key
    projectModal.querySelectorAll("[data-close]").forEach(function(el) {
        el.addEventListener("click", closeProject);
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && !projectModal.hidden) {
            closeProject();
        }
    });
}

// ---- Minesweeper game ----
const msGrid = document.getElementById("ms-grid");

if (msGrid) {
    const ROWS = 16;
    const COLS = 16;
    const MINES = 40;

    const mineCountEl = document.getElementById("ms-mine-count");
    const messageEl = document.getElementById("ms-message");
    const restartBtn = document.getElementById("ms-restart-btn");

    let board = [];          // 2D array of cell objects
    let flagCount = 0;
    let revealedCount = 0;
    let minesPlaced = false;
    let gameOver = false;

    function updateStatus() {
        mineCountEl.textContent = "Mines left: " + (MINES - flagCount);
    }

    function forEachNeighbor(r, c, callback) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    callback(board[nr][nc]);
                }
            }
        }
    }

    // Lay mines after the first click so the first cell is always safe
    function placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            const cell = board[r][c];

            if (cell.mine) continue;
            // keep the first-clicked cell and its neighbors mine-free
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;

            cell.mine = true;
            placed++;
        }

        // count adjacent mines for every non-mine cell
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].mine) continue;
                let count = 0;
                forEachNeighbor(r, c, function(n) { if (n.mine) count++; });
                board[r][c].adjacent = count;
            }
        }

        minesPlaced = true;
    }

    function revealCell(cell) {
        if (cell.revealed || cell.flagged) return;

        cell.revealed = true;
        revealedCount++;
        cell.el.classList.add("revealed");

        if (cell.adjacent > 0) {
            cell.el.textContent = cell.adjacent;
            cell.el.classList.add("n" + cell.adjacent);
        } else {
            // flood-fill outward through empty cells
            forEachNeighbor(cell.r, cell.c, function(n) { revealCell(n); });
        }
    }

    function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = board[r][c];
                if (cell.mine) {
                    cell.el.classList.add("revealed", "mine");
                    cell.el.textContent = "✷";
                }
            }
        }
    }

    function endGame(won) {
        gameOver = true;
        if (won) {
            messageEl.textContent = "You win!";
            messageEl.className = "win";
        } else {
            messageEl.textContent = "Game over";
            messageEl.className = "lose";
            revealAllMines();
        }
    }

    function handleReveal(cell) {
        if (gameOver || cell.flagged || cell.revealed) return;

        if (!minesPlaced) placeMines(cell.r, cell.c);

        if (cell.mine) {
            cell.el.classList.add("revealed", "mine");
            cell.el.textContent = "✷";
            endGame(false);
            return;
        }

        revealCell(cell);

        if (revealedCount === ROWS * COLS - MINES) {
            endGame(true);
        }
    }

    function handleFlag(cell) {
        if (gameOver || cell.revealed) return;

        cell.flagged = !cell.flagged;
        cell.el.classList.toggle("flagged", cell.flagged);
        cell.el.textContent = cell.flagged ? "⚑" : "";
        flagCount += cell.flagged ? 1 : -1;
        updateStatus();
    }

    function buildBoard() {
        board = [];
        flagCount = 0;
        revealedCount = 0;
        minesPlaced = false;
        gameOver = false;

        messageEl.textContent = "";
        messageEl.className = "";
        msGrid.innerHTML = "";
        updateStatus();

        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < COLS; c++) {
                const el = document.createElement("button");
                el.type = "button";
                el.className = "ms-cell";

                const cell = { r: r, c: c, mine: false, revealed: false, flagged: false, adjacent: 0, el: el };

                el.addEventListener("click", function() { handleReveal(cell); });
                el.addEventListener("contextmenu", function(event) {
                    event.preventDefault();
                    handleFlag(cell);
                });

                msGrid.appendChild(el);
                row.push(cell);
            }
            board.push(row);
        }
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", buildBoard);
    }

    buildBoard();
}