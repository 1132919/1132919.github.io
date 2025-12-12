/*jshint esversion:6*/
/*jshint loopfunc: true*/

// 遊戲主變數
let board = Array(9).fill(null); // 棋盤狀態
let current = 'X'; // 當前玩家（玩家為X）
let active = true; // 控制遊戲是否進行中

// 初始化棋盤
function init() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '玩家 (X) 先手';

    // 建立9個格子
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => playerMove(i);
        boardEl.appendChild(cell);
    }
}

// 玩家下棋
function playerMove(i) {
    if (!active || board[i]) return;
    board[i] = 'X';
    updateBoard();

    if (checkWin('X')) {
        endGame('玩家 (X) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }

    active = false; // 禁止連點
    current = 'O';
    document.getElementById('status').innerText = '電腦思考中...';

    setTimeout(computerMove, 400);
}

// 電腦 AI 下棋邏輯（包含：優先中心 + Minimax）
function computerMove() {

    // --- 進階智慧：優先選擇中心位置 ---
    if (board[4] === null) {
        board[4] = 'O';
        updateBoard();

        if (checkWin('O')) {
            endGame('電腦 (O) 勝利！');
            return;
        } else if (isFull()) {
            endGame('平手！');
            return;
        }

        current = 'X';
        active = true;
        document.getElementById('status').innerText = '輪到玩家 (X)';
        return; // 一定要 return，不然會繼續 Minimax
    }

    // --- Minimax 不敗 AI ---
    let bestScore = -Infinity;
    let bestMoves = []; // 儲存所有同分的最佳步

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [i]; // 找到更好的分數 → 重設列表
            } else if (score === bestScore) {
                bestMoves.push(i); // 分數相同 → 加到列表中
            }
        }
    }

// 從最佳步中「隨機挑一個」
// 讓 AI 不會每次都走同樣的步
let move = bestMoves[Math.floor(Math.random() * bestMoves.length)];


    // 備援策略（通常不會進入）
    if (move === null) {
        move = findWinningMove('O');
        if (move === null) move = findWinningMove('X');
        if (move === null) move = getRandomMove();
    }

    board[move] = 'O';
    updateBoard();

    if (checkWin('O')) {
        endGame('電腦 (O) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }

    current = 'X';
    active = true;
    document.getElementById('status').innerText = '輪到玩家 (X)';
}

// Minimax 不敗 AI
function minimax(board, depth, isMaximizing) {

    // 終局評估
    if (checkWin('O')) return 10 - depth;
    if (checkWin('X')) return depth - 10;
    if (isFull()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;

    } else {
        let bestScore = Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(bestScore, score);
            }
        }

        return bestScore;
    }
}

// 找到可立即獲勝的位置
function findWinningMove(player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let [a,b,c] of wins) {
        const line = [board[a], board[b], board[c]];
        if (line.filter(v => v === player).length === 2 && line.includes(null)) {
            return [a,b,c][line.indexOf(null)];
        }
    }
    return null;
}

// 隨機選擇空格
function getRandomMove() {
    const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
}

// 更新畫面
function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        cells[i].innerText = board[i] || '';
    }
}

// 判斷勝利
function checkWin(player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return wins.some(([a,b,c]) =>
        board[a] === player && board[b] === player && board[c] === player
    );
}

// 判斷平手
function isFull() {
    return board.every(cell => cell !== null);
}

// 結束遊戲
function endGame(message) {
    document.getElementById('status').innerText = message;
    active = false;
}

// 重開一局
function resetGame() {
    init();
}

// 初始化
init();
