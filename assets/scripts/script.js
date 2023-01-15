let board = [];
let tilesClicked = 0;

let gameRow = 9;
let gameColumn = 9;

let mines = 10;
let minesLocation = [];

let flagMode = false;
let gameStarted = false;

// HTML.
const boardHTML = document.querySelector(".__board");
const flagButton = document.querySelector("._flag");
const minesCounter = document.querySelector("._mines-count");
const timerHTML = document.querySelector(".__timer");
const smileyFace = document.querySelector("._smiley-face");

function loadBoard() {
	for (let r = 0; r < gameRow; r++) {
		for (let c = 0; c < gameColumn; c++) {
			let tile = document.createElement("div");
			tile.id = `${r}-${c}`;
			tile.classList.add("_tile");
			tile.addEventListener("click", clickTile);
			tile.addEventListener("contextmenu", placeFlag);
			tile.addEventListener("mousedown", faceWhenHold);
			tile.addEventListener("mouseup", faceWhenReleaseHold);
			boardHTML.append(tile);

			// Fill board array.
			board.push(`${r}-${c}`);
		};
	};

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

function clickTile() {
	if (!gameStarted) {
		gameStarted = true;
		startTimer();
	};
	
	if (flagMode) {
		placeFlag(null, this);
		return;
	};

	// Check if mines is clicked.
	minesLocation.forEach(m => {
		if (this.id === m) {
			// If there is no flag, then you can click.
			if (!this.contains(this.querySelector("img"))) {
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

	if (currentTile.classList.contains("clicked") || currentTile.contains(currentTile.querySelector("img"))) {
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
			currentTile.innerText = minesFound;
			// currentTile.classList.add(`t${minesFound}`);
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
	let mineIcon = document.createElement("img");
	mineIcon.src = "assets/Images/sun.svg";

	minesLocation.forEach(m => {
		let tileWithMine = document.getElementById(m);
		tileWithMine.innerHTML = "";
		tileWithMine.append(mineIcon.cloneNode());
		tileWithMine.classList.add("clicked");
	});
};

function endGame(tile) {
	tile.classList.remove("clicked");
	tile.style.background = "rgba(255, 0, 0, 0.4)";
	flagButton.removeEventListener("click", setFlagMode);
	boardHTML.childNodes.forEach(t => t.removeEventListener("click", clickTile));
	boardHTML.childNodes.forEach(t => t.removeEventListener("contextmenu", placeFlag));
	boardHTML.childNodes.forEach(t => t.removeEventListener("mousedown", faceWhenHold));
	boardHTML.childNodes.forEach(t => t.removeEventListener("mouseup", faceWhenReleaseHold));
	smileyFace.innerText = ":(";
};

function winGame() {
	if (tilesClicked === 71) {
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
	mines = 10;
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

	if (!tile.contains(tile.querySelector("img")) && !tile.classList.contains("clicked")) {
		tile.innerHTML = "";
		tile.append(flagIcon);

		mines -= 1;
	} else if (tile.contains(tile.querySelector("img"))) {
		tile.innerHTML = "";
		mines += 1;
	};

	minesCounter.innerText = mines;
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
flagButton.addEventListener("click", setFlagMode);

document.addEventListener("DOMContentLoaded", () => {
	loadBoard();
});