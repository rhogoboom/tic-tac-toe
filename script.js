const Gameboard = (() => {

    const _gameGrid = _makeGrid();

    //Cache DOM
    const _spaces = document.querySelectorAll(".space");

    // Add Data Attributes to board for coordinates


    function _makeGrid() {
        const grid = [];
        for (let i = 0; i < 3; i++) {
            const row = []
            for (let j = 0; j < 3; j++) {
                row.push(0);
            }
            grid.push(row);
        }
        return grid;
    }

    function getGrid() {
        return _gameGrid;
    }

    function getSpaces() {
        return _spaces;
    }

    function resetBoard() {
        _spaces.forEach((space) => {
            space.classList.remove('clicked');
            space.textContent = '';
        })
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                _gameGrid[i][j] = 0;
            }
        }
    }

    function getTransposedGrid(grid) {
        const transposedGrid = _makeGrid();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                transposedGrid[j][i] = grid[i][j];
            }
        }
        return transposedGrid;
    }

    function displaySymbolOnBoard(x, y, symbol) {
        _gameGrid[x][y] = symbol;

    }

    return ({ resetBoard, getTransposedGrid, displaySymbolOnBoard, getGrid, getSpaces })

})()


const Player = (symbol) => {

    let score = 0;
    let active = false;
    const playerSign = symbol;

    function takeTurn() {
        changeStatus();
    }

    function getStatus() {
        return active;
    }

    function changeStatus() {
        active = !active;
    }

    function getSign() {
        return playerSign;
    }
    return { getStatus, takeTurn, getSign, playerSign };
}

const HumanPlayer = (symbol) => {
    const prototype = Player(symbol);
    const isHuman = true;
    return Object.assign({}, prototype, { isHuman });
}

const ComputerPlayer = (symbol) => {
    const prototype = Player(symbol);
    const isHuman = false;
    function takeTurn() {
        const currentGrid = Gameboard.getGrid();
        let computerChoiceIndex;
        let keepGoing = true;
        while (keepGoing) {
            let i = generateRandInt(0, 2);
            let j = generateRandInt(0, 2);
            keepGoing = currentGrid[i][j] != 0;
            if (!keepGoing) {
                currentGrid[i][j] = prototype.getSign();
                computerChoiceIndex = [i, j]
            }
        }
        const comChoiceSquare = document.querySelector(`[data-row='${computerChoiceIndex[0]}'][data-column='${computerChoiceIndex[1]}']`);
        comChoiceSquare.classList.add('clicked')
        comChoiceSquare.textContent = prototype.getSign();
        if (GameFlow.checkWin(prototype.getSign(), currentGrid)) {
            handleWin();
            return;
        };
        changeActivePlayer();

    }
    function makeValidChoice(grid) {
        let computerChoiceIndex;
        let keepGoing = true;
        while (keepGoing) {
            let i = generateRandInt(0, 2);
            let j = generateRandInt(0, 2);
            keepGoing = grid[i][j] != 0;
            if (!keepGoing) {
                computerChoiceIndex = [i, j]
            }
        }
        return computerChoiceIndex;
    }


    function generateRandInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1));
    }

    return Object.assign({}, prototype, { isHuman, makeValidChoice });
}


const GameFlow = (() => {

    // Default Start
    let player1 = HumanPlayer("X");
    let player2 = ComputerPlayer("O");
    let activePlayer = player1;

    //Cache DOM
    const _gameOverModal = document.querySelector(".game-over-modal")
    const _gameOverText = document.querySelector(".game-over-modal > p")
    const _restartButton = document.querySelector(".game-over-modal > button")

    // Iniitalize board

    initializeBoard();


    function initializeBoard() {
        let x = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const space = Gameboard.getSpaces()[x]
                space.addEventListener('click', playerTurn);
                space.dataset.row = i;
                space.dataset.column = j;
                x++;
            }
        }
    }



    // Modal event listeners

    function openGameOverModal() {
        _gameOverModal.style.display = 'flex';
        _restartButton.addEventListener('click', closeGameOverModal);

    }

    function updateGameOverModal() {
        _gameOverText.textContent = `${getActivePlayer().getSign()} wins!`
    }

    function closeGameOverModal() {
        Gameboard.resetBoard();
        activePlayer = player1;
        initializeBoard();
        _restartButton.removeEventListener('click', closeGameOverModal);
        _gameOverModal.style.display = 'none';
    }


    // Handle Win

    function handleWin() {
        updateGameOverModal();
        removeListeners();
        openGameOverModal();

    }



    function removeListeners() {
        Gameboard.getSpaces().forEach((space) => {
            space.removeEventListener('click', playerTurn);
        })
    }

    // Player Turn
    function playerTurn(e) {

        const coordinates = [parseInt(e.target.dataset.row), parseInt(e.target.dataset.column)];
        if (!e.target.classList.contains('clicked')) {
            turnFunc(Gameboard.getGrid(), coordinates, getActivePlayer().getSign());
            if (!getActivePlayer().isHuman) {
                const comCoords = activePlayer.makeValidChoice(Gameboard.getGrid());
                turnFunc(Gameboard.getGrid(), comCoords, getActivePlayer().getSign());
                

            }
        }
    }

    function turnFunc(grid, coords, symbol) {
        const choiceSquare = document.querySelector(`[data-row='${coords[0]}'][data-column='${coords[1]}']`);
        choiceSquare.classList.add('clicked');
        choiceSquare.textContent = symbol;
        grid[coords[0]][coords[1]] = symbol;
        if (checkWin(symbol, grid)) {
            handleWin();
            return;
        }
        changeActivePlayer();
    }


    // Win Check and helper functions
    function checkWin(symbol, board) {
        return horizontalWin(symbol, board) || verticalWin(symbol, board) || diagonalWin(symbol, board);
    }

    function horizontalWin(symbol, board) {
        for (let i = 0; i < 3; i++) {
            if (board[i].every((element) => element === symbol)) {
                return true;
            }
        }
        return false;

    }

    function verticalWin(symbol, board) {
        return horizontalWin(symbol, Gameboard.getTransposedGrid(board))

    }

    function diagonalWin(symbol, board) {
        if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[2][2] == symbol) {
            return true;
        } else if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[2][0] == symbol) {
            return true;
        } else {
            return false;
        };

    }

    function setActivePlayer(player) {
        activePlayer = player;
    }

    function setPlayers(a, b) {
        player1 = a;
        player2 = b;
    }

    function getActivePlayer() {
        return activePlayer;
    }

    function changeActivePlayer() {
        activePlayer = activePlayer == player1 ? player2 : player1;
    }

    return { getActivePlayer, changeActivePlayer, playerTurn, removeListeners, initializeBoard, setActivePlayer, setPlayers }

})();


const Settings = (() => {

    // Cache DOM
    const _settingsModal = document.querySelector(".settings-modal");
    const _lightModeButton = document.querySelector(".light-mode-button");
    const _settingsButton = document.querySelector(".settings-button");
    const _closeSettingsButton = document.querySelector(".close-modal-button")
    const _root = document.documentElement;
    const _playerTypeToggle = document.querySelectorAll(".player-type-toggle")
    const _playerSymbolToggle = document.querySelectorAll(".player-symbol-toggle")
    const resetGameButton = document.querySelector('.reset-game')



    // Add Event Listeners
    _settingsButton.addEventListener('click', openSettingsModal);
    _lightModeButton.addEventListener('click', toggleTheme);
    _playerTypeToggle.forEach((toggle) => {
        toggle.addEventListener('click', _toggleType);
    })
    _playerSymbolToggle.forEach((toggle) => {
        toggle.addEventListener('click', _toggleSymbol);
    })
    resetGameButton.addEventListener('click', resetGame);





    function openSettingsModal() {
        _settingsModal.style.display = 'grid';
        _closeSettingsButton.addEventListener('click', closeSettingsModal);
        GameFlow.removeListeners();

        // _restartButton.addEventListener('click', closeGameOverModal);

    }

    function closeSettingsModal() {
        _settingsModal.style.display = 'none';
        GameFlow.initializeBoard();
        _closeSettingsButton.removeEventListener('click', closeSettingsModal);

    }

    function _toggleType(e) {
        if (e.target.dataset.playertype === 'human') {
            e.target.dataset.playertype = 'computer';
            e.target.textContent = 'Computer';
        } else if (e.target.dataset.playertype === 'computer') {
            e.target.dataset.playertype = 'human';
            e.target.textContent = 'Human';
        }
    }

    function _toggleSymbol(e) {
        const clickedPlayer = e.target
        const clickedSymbol = clickedPlayer.dataset.playersymbol;
        const otherPlayerNum = clickedPlayer.dataset.playernum === '1' ? '2' : '1';
        const otherPlayer = document.querySelector(`.player-${otherPlayerNum} > li > .player-symbol-toggle`);
        clickedPlayer.dataset.playersymbol = otherPlayer.dataset.playersymbol;
        clickedPlayer.textContent = otherPlayer.dataset.playersymbol;
        otherPlayer.dataset.playersymbol = clickedSymbol;
        otherPlayer.textContent = clickedSymbol;


    }


    function toggleTheme() {
        const newTheme = _root.className === 'dark' ? 'light' : 'dark';
        _root.className = newTheme
        if (newTheme === 'dark') {
            _settingsButton.src = 'icons/settings_white_36dp.svg';
            _lightModeButton.src = 'icons/light_mode_white_36dp.svg'
        } else {
            _settingsButton.src = 'icons/settings_black_36dp.svg';
            _lightModeButton.src = 'icons/light_mode_black_36dp.svg'
        }
    }

    function resetGame() {
        const newPlayers = makePlayers();
        GameFlow.setPlayers(newPlayers[0], newPlayers[1])
        console.dir(newPlayers)
        Gameboard.resetBoard();
        GameFlow.initializeBoard();
        GameFlow.setActivePlayer(newPlayers[0]);
        closeSettingsModal();
    }

    function makePlayers() {
        const playerTypes = Array.from(_playerTypeToggle);
        const playerSymbols = Array.from(_playerSymbolToggle);
        const player1Type = playerTypes.filter(item => item.dataset.playernum === '1')[0].dataset.playertype;
        const player1Symbol = playerSymbols.filter(item => item.dataset.playernum === '1')[0].dataset.playersymbol;
        const player2Type = playerTypes.filter(item => item.dataset.playernum === '2')[0].dataset.playertype;
        const player2Symbol = playerSymbols.filter(item => item.dataset.playernum === '2')[0].dataset.playersymbol;
        let player1;
        let player2;
        if (player1Type === 'human') {
            player1 = HumanPlayer(player1Symbol);
        } else {
            player1 = ComputerPlayer(player1Symbol);
        }

        if (player2Type === 'human') {
            player2 = HumanPlayer(player2Symbol);
        } else {
            player2 = ComputerPlayer(player2Symbol);
        }

        return [player1, player2];

    }

    return { makePlayers }

})();