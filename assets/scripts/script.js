let board = [];
let tilesClicked = 0;

let gameRow = 9;
let gameColumn = 9;

let mines = 10;
let minesLeft = mines;
let minesLocation = [];

let flagMode = false;
let gameStarted = false;
let difficulty = "Beginner";

// HTML.
const boardHTML = document.querySelector(".__board");
const timerHTML = document.querySelector(".__timer");
const smileyFace = document.querySelector("._smiley-face");
const minesCounter = document.querySelector("._mines-count");

const flagButton = document.querySelector("._flag");
const difficultyButtons = document.querySelectorAll("._game-difficulty span");

function loadBoard() {
	for (let r = 0; r < gameRow; r++) {
		for (let c = 0; c < gameColumn; c++) {
			let tile = document.createElement("div");
			tile.id = `${r}-${c}`;
			tile.classList.add("_tile");
			tile.dataset.flagged = false;
			tile.addEventListener("click", clickTile);
			tile.addEventListener("contextmenu", placeFlag);
			tile.addEventListener("mousedown", faceWhenHold);
			tile.addEventListener("mouseup", faceWhenReleaseHold);
			boardHTML.append(tile);

			// Fill board array.
			board.push(`${r}-${c}`);
		};
	};

	// minesCounter.innerText = minesLeft;
	loadMines();
};

function loadMines() {
	for (let i = 0; i < mines; i++) {
		let randomRow = Math.floor(Math.random() * gameRow);
		let randomColumn = Math.floor(Math.random() * gameColumn);

		if (!minesLocation.includes(`${randomRow}-${randomColumn}`)) {
			minesLocation.push(`${randomRow}-${randomColumn}`);
			minesLocation.splice(mines, mines + 1)

			if (minesLocation.length < mines) {
				loadMines();
			};

		};
	};
};

function difficultySet() {
	difficulty = this.innerText;
	difficultyButtons.forEach(button => button.classList.remove("chosen_"));
	boardHTML.innerHTML = "";

	if (difficulty == "Beginner") {
		gameRow = 9;
		gameColumn = 9;
		mines = 10;
		
		this.classList.add("chosen_");
	} else if (difficulty == "Intermediate") {
		gameRow = 16;
		gameColumn = 16;
		mines = 40;

		this.classList.add("chosen_");
	} else if (difficulty == "Expert") {
		gameRow = 16;
		gameColumn = 30;
		mines = 99;

		this.classList.add("chosen_");
	};

	document.querySelector("main").style.maxWidth = `calc(${gameColumn}px * 16 + 2px)`;
	boardHTML.style.gridTemplateColumns = `repeat(${gameColumn}, 1fr)`;
	boardHTML.style.gridTemplateRows = `repeat(${gameRow}, 1fr)`;
	resetGame();
};

function clickTile() {
	if (!gameStarted) {
		gameStarted = true;
		startTimer();
	};
	
	if (flagMode) {
		placeFlag(null, this);
		return;
	};

	if (this.dataset.flagged == "flagged") return;

	// Check if mines is clicked.
	minesLocation.forEach(m => {
		if (this.id === m) {
			// If there is no flag, then you can click.
			if (!this.classList.contains("mine_")) {
				gameStarted = false;

				revealMines();
				endGame(this);
				return;
			};
		};
	});

	let coordinate = this.id.split("-");
	checkMine(coordinate[0], coordinate[1]);
};

function checkMine(rr, cc) {
	// Change to number (idk why it doesn't work if i don't do this.).
    let r = Number(rr);
    let c = Number(cc);

	if (r < 0 || r >= gameRow || c < 0 || c >= gameColumn) {
        return;
    }

	let currentTile = document.getElementById(`${r}-${c}`);

	if (currentTile.classList.contains("clicked")) {
		return;
	} else {
		currentTile.classList.add("clicked");
	};

	let minesFound = 0;
	tilesClicked += 1;

	// Check surrounding tile.

		// Top 3 from current tile.
	minesFound += checkSurrounding(r-1, c-1);
	minesFound += checkSurrounding(r-1, c);
	minesFound += checkSurrounding(r-1, c+1);

		// Left & Right.
	minesFound += checkSurrounding(r, c-1);
	minesFound += checkSurrounding(r, c+1);

		// Bottom 3
	minesFound += checkSurrounding(r+1, c-1);
	minesFound += checkSurrounding(r+1, c);
	minesFound += checkSurrounding(r+1, c+1);

	if (minesFound > 0) {
		if (currentTile.contains(currentTile.querySelector("img"))) {
			return;
		} else {
			currentTile.classList.add(`t${minesFound}_`);
		};
	} else { // Recursion.
			// Top 3 from current tile.
		checkMine(r-1, c-1);
		checkMine(r-1, c);
		checkMine(r-1, c+1);

			// Left & Right.
		checkMine(r, c-1);
		checkMine(r, c+1);

			// Bottom 3
		checkMine(r+1, c-1);
		checkMine(r+1, c);
		checkMine(r+1, c+1);
	};

	if (currentTile.innerText == "?") currentTile.innerText = "";

	winGame();	
};

function checkSurrounding(r, c) {
	if (r < 0 || r >= gameRow || c < 0 || c >= gameColumn) {
        return 0;
    };

    if (minesLocation.includes(`${r}-${c}`)) {
        return 1;
    };

    return 0;
};

function revealMines() {
	minesLocation.forEach(m => {
		let tileWithMine = document.getElementById(m);
		tileWithMine.classList.add("mine_");

		if (tileWithMine.dataset.flagged == "flagged") {
			// The one that has a flag on it.
		};
	});
};

function endGame(tile) {
	tile.classList.add("mine-clicked_");
	boardHTML.childNodes.forEach(t => t.removeEventListener("click", clickTile));
	boardHTML.childNodes.forEach(t => t.removeEventListener("contextmenu", placeFlag));
	boardHTML.childNodes.forEach(t => t.removeEventListener("mousedown", faceWhenHold));
	boardHTML.childNodes.forEach(t => t.removeEventListener("mouseup", faceWhenReleaseHold));
	smileyFace.innerText = ":(";
};

function winGame() {
	if (tilesClicked == gameRow * gameColumn - mines) {
		smileyFace.innerText = ":D";
		flagButton.removeEventListener("click", setFlagMode);
		boardHTML.childNodes.forEach(t => t.removeEventListener("click", clickTile));
		boardHTML.childNodes.forEach(t => t.removeEventListener("contextmenu", placeFlag));
		boardHTML.childNodes.forEach(t => t.removeEventListener("mousedown", faceWhenHold));
		boardHTML.childNodes.forEach(t => t.removeEventListener("mouseup", faceWhenReleaseHold));
		gameStarted = false;
		revealMines();
	};
};

function resetGame() {
	tilesClicked = 0;
	// mines = difficulty == "Beginner" ? 10 : difficulty == "Intermediate" ? 40 : 99;
	minesLeft = mines
	minesCounter.innerText = mines;
	minesLocation = [];
	boardHTML.innerHTML = "";
	smileyFace.innerText = ":)";
	gameStarted = false;
	setTimeout(() => timerHTML.innerText = "000", 1000);
	loadBoard();
};

function setFlagMode() {
	if (flagMode) {
		flagMode = false;
		flagButton.classList.remove("flag-clicked");

		boardHTML.childNodes.forEach(t => t.addEventListener("mousedown", faceWhenHold));
		boardHTML.childNodes.forEach(t => t.addEventListener("mouseup", faceWhenReleaseHold));
	} else {
		flagMode = true;
		flagButton.classList.add("flag-clicked");

		boardHTML.childNodes.forEach(t => t.removeEventListener("mousedown", faceWhenHold));
		boardHTML.childNodes.forEach(t => t.removeEventListener("mouseup", faceWhenReleaseHold));
	};
};

function placeFlag(e, tile = this) {
	if (e !== null) {
		// For the right click.
		e.preventDefault();
	};

	let flagIcon = document.createElement("img");
	flagIcon.src = "assets/Images/flag.svg";

	if (tile.dataset.flagged == "false" && !tile.classList.contains("clicked")) {
		tile.innerHTML = "";
		tile.append(flagIcon);
		tile.dataset.flagged = "flagged";
		
		minesLeft -= 1;
	} else if (tile.dataset.flagged == "flagged") {
		tile.innerText = "?";
		tile.dataset.flagged = "question-mark";
		
		minesLeft += 1;
	} else if (tile.dataset.flagged == "question-mark") {
		tile.innerText = "";
		tile.dataset.flagged = false;
	};

	minesCounter.innerText = minesLeft;
	return;
};

function startTimer() {
	let currentTimer = 0;

	let timer = setInterval(() => {
		currentTimer += 1;

		if (currentTimer < 10) {
			timerHTML.innerText = `00${currentTimer}`;
		} else if (currentTimer < 100) {
			timerHTML.innerText = `0${currentTimer}`;
		} else if (currentTimer < 1000) {
			timerHTML.innerText = currentTimer;
		};

		if (!gameStarted || currentTimer ==- 999) {
			clearInterval(timer);
		};
	}, 1000);

};

function faceWhenHold() {
	smileyFace.innerText = ":o";
};

function faceWhenReleaseHold() {
	smileyFace.innerText = ":)";
};

smileyFace.addEventListener("click", resetGame);
difficultyButtons.forEach(button => button.addEventListener("click", difficultySet));

document.addEventListener("DOMContentLoaded", () => {
	loadBoard();
});