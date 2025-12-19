const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

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
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.onclick = () => playerMove(i, j);

      if (board[i][j] !== EMPTY) {
        const piece = document.createElement("div");
        piece.className = "piece " + (board[i][j] === BLACK ? "black" : "white");
        cell.appendChild(piece);
      }

      boardDiv.appendChild(cell);
    }
  }
}

function playerMove(x, y) {
  if (currentPlayer !== BLACK) return;
  if (!isValidMove(x, y, BLACK)) return;

  makeMove(x, y, BLACK);
  currentPlayer = WHITE;
  updateStatus();
  setTimeout(computerMove, 600);
}

function computerMove() {
  let move;
  if (difficultySelect.value === "easy") {
    move = computerEasy();
  } else {
    move = computerHard();
  }

  if (move) {
    makeMove(move.x, move.y, WHITE);
  }

  currentPlayer = BLACK;
  updateStatus();
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
  flipPieces(x, y, player);
  renderBoard();
}

function flipPieces(x, y, player) {
  const opponent = player === BLACK ? WHITE : BLACK;
  const dirs = [-1, 0, 1];

  for (let dx of dirs) {
    for (let dy of dirs) {
      if (dx === 0 && dy === 0) continue;
      let pieces = [];
      let i = x + dx, j = y + dy;

      while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        if (board[i][j] === opponent) {
          pieces.push({ i, j });
        } else if (board[i][j] === player) {
          pieces.forEach((p, idx) => {
            setTimeout(() => {
              board[p.i][p.j] = player;
              renderBoard();
            }, idx * 150);
          });
          break;
        } else {
          break;
        }
        i += dx;
        j += dy;
      }
    }
  }
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
  statusDiv.textContent =
    currentPlayer === BLACK ? "你的回合（黑棋）" : "電腦思考中（白棋）";
}
