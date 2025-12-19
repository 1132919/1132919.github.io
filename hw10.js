const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const restartBtn = document.getElementById("restartBtn");
restartBtn.onclick = restartGame;

const PASS_MESSAGE_DELAY = 2000; // 跳過提示停留 2 秒

let passCount = 0; // 連續無合法步次數
let currentPlayer = BLACK;
let board = [];

const boardDiv = document.getElementById("board");
const statusDiv = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");

initBoard();
renderBoard();
updateStatus();

function initBoard() {
  board = Array(8).fill().map(() => Array(8).fill(EMPTY));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
}

function renderBoard() {
  boardDiv.innerHTML = "";
  const showHint = currentPlayer === BLACK;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.onclick = () => playerMove(i, j);

      if (board[i][j] !== EMPTY) {
        const piece = document.createElement("div");
        piece.className = "piece " + (board[i][j] === BLACK ? "black" : "white");
        cell.appendChild(piece);
      } else if (showHint && isValidMove(i, j, BLACK)) {
        const hint = document.createElement("div");
        hint.className = "hint " + (isCorner(i, j) ? "corner" : "normal");
        cell.appendChild(hint);
      }

      boardDiv.appendChild(cell);
    }
  }
}

function playerMove(x, y) {
  if (currentPlayer !== BLACK) return;
  if (!isValidMove(x, y, BLACK)) return;

  passCount = 0;
  makeMove(x, y, BLACK);
  currentPlayer = WHITE;
  updateStatus();

  setTimeout(handleTurn, 600);
}

function computerMove() {
  const move = difficultySelect.value === "easy" ? computerEasy() : computerHard();

  if (move) {
    passCount = 0;
    makeMove(move.x, move.y, WHITE);
  }

  currentPlayer = BLACK;
  updateStatus();
  setTimeout(handleTurn, 600);
}

function isValidMove(x, y, player) {
  if (board[x][y] !== EMPTY) return false;
  const opponent = player === BLACK ? WHITE : BLACK;
  const dirs = [-1, 0, 1];

  for (let dx of dirs) {
    for (let dy of dirs) {
      if (dx === 0 && dy === 0) continue;
      let i = x + dx, j = y + dy;
      let foundOpponent = false;

      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        if (board[i][j] === opponent) {
          foundOpponent = true;
        } else if (board[i][j] === player && foundOpponent) {
          return true;
        } else {
          break;
        }
        i += dx;
        j += dy;
      }
    }
  }
  return false;
}

function makeMove(x, y, player) {
  board[x][y] = player;
  renderBoard();
  flipPiecesSequential(x, y, player);
}

function getAllValidMoves(player) {
  let moves = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (isValidMove(i, j, player)) {
        moves.push({ x: i, y: j });
      }
    }
  }
  return moves;
}

function computerEasy() {
  const moves = getAllValidMoves(WHITE);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function computerHard() {
  const moves = getAllValidMoves(WHITE);
  if (moves.length === 0) return null;

  let best = moves[0];
  let bestScore = -999;

  moves.forEach(m => {
    let score = countFlips(m.x, m.y, WHITE);
    if (isCorner(m.x, m.y)) score += 100;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  });

  return best;
}

function countFlips(x, y, player) {
  let count = 0;
  const opponent = player === BLACK ? WHITE : BLACK;
  const dirs = [-1, 0, 1];

  for (let dx of dirs) {
    for (let dy of dirs) {
      if (dx === 0 && dy === 0) continue;
      let i = x + dx, j = y + dy;
      let temp = 0;

      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        if (board[i][j] === opponent) {
          temp++;
        } else if (board[i][j] === player) {
          count += temp;
          break;
        } else {
          break;
        }
        i += dx;
        j += dy;
      }
    }
  }
  return count;
}

function isCorner(x, y) {
  return (x === 0 || x === 7) && (y === 0 || y === 7);
}

function updateStatus() {
  if (checkGameOver()) return;

  statusDiv.textContent =
    currentPlayer === BLACK
      ? "你的回合（黑棋）"
      : "電腦回合（白棋）";
}

function restartGame() {
  passCount = 0;
  currentPlayer = BLACK;
  initBoard();
  renderBoard();
  updateStatus();
}

function hasAnyValidMove(player) {
  return getAllValidMoves(player).length > 0;
}

function countScore() {
  let black = 0, white = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === BLACK) black++;
      if (cell === WHITE) white++;
    }
  }
  return { black, white };
}

function checkGameOver() {
  if (isBoardFull() || passCount >= 2) {
    const score = countScore();
    showGameResult(score);
    return true;
  }
  return false;
}

function showGameResult(score) {
  let result = "";
  if (score.black > score.white) result = "你贏了！";
  else if (score.black < score.white) result = "電腦獲勝！";
  else result = "平手！";

  statusDiv.innerHTML = `
    遊戲結束<br>
    黑棋：${score.black}　白棋：${score.white}<br>
    ${result}
  `;
}

function flipPiecesSequential(x, y, player) {
  const opponent = player === BLACK ? WHITE : BLACK;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [ 0, -1],          [ 0, 1],
    [ 1, -1], [ 1, 0], [ 1, 1]
  ];

  directions.forEach(([dx, dy]) => {
    let i = x + dx;
    let j = y + dy;
    let line = [];

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      if (board[i][j] === opponent) {
        line.push({ i, j });
      } else if (board[i][j] === player) {
        line.forEach((pos, idx) => {
          setTimeout(() => {
            const index = pos.i * 8 + pos.j;
            const cell = boardDiv.children[index];
            const piece = cell.querySelector(".piece");

            if (piece) {
              piece.classList.add("flip");
              setTimeout(() => {
                board[pos.i][pos.j] = player;
                renderBoard();
              }, 200);
            }
          }, idx * 150);
        });
        break;
      } else {
        break;
      }
      i += dx;
      j += dy;
    }
  });
}

function handleTurn() {
  renderBoard(); // ← 每回合都更新提示

  if (isBoardFull()) {
    checkGameOver();
    return;
  }

  if (!hasAnyValidMove(currentPlayer)) {
    passCount++;
    statusDiv.textContent =
      (currentPlayer === BLACK ? "你" : "電腦") +
      "沒有合法落子，跳過回合";

    if (passCount >= 2) {
      setTimeout(() => checkGameOver(), PASS_MESSAGE_DELAY);
      return;
    }

    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    setTimeout(handleTurn, PASS_MESSAGE_DELAY);
    return;
  }

  passCount = 0;

  if (currentPlayer === WHITE) {
    setTimeout(computerMove, 600);
  } else {
    updateStatus();
  }
}

function isBoardFull() {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++)
      if (board[i][j] === EMPTY) return false;
  return true;
}
