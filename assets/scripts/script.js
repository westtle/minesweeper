let board = [];
let tilesClicked = 0;

let gameRow = 9;
let gameColumn = 9;

let mines = 10;
let minesLeft = mines;
let minesLocation = [];

let gameStarted = false;
let difficulty = "Beginner";

// HTML.
const boardHTML = document.querySelector(".__board");
const timerHTML = document.querySelector("._timer");
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

			holdEffect(tile, "hold_");

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

	if (currentTile.classList.contains("clicked_") || currentTile.classList.contains("mine_")) {
		return;
	} else {
		currentTile.classList.add("clicked_");
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

	if (currentTile.classList.contains("question-mark_")) currentTile.classList.remove("question-mark_");

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
		tileWithMine.classList.remove("question-mark_");
		tileWithMine.classList.add("mine_");

		if (tileWithMine.dataset.flagged == "flagged") {
			// The one that has a flag on it.
			tileWithMine.classList.remove("flagged_");
			tileWithMine.classList.add("mine-flagged_");
		};
	});
};

function endGame(tile) {
	tile.classList.add("mine-clicked_");
	boardHTML.childNodes.forEach(t => t.style.pointerEvents = "none");
	smileyFace.classList.add("face-lose_");
};

function winGame() {
	if (tilesClicked == gameRow * gameColumn - mines) {
		gameStarted = false;

		boardHTML.childNodes.forEach(t => t.style.pointerEvents = "none");
		smileyFace.classList.add("face-win_");
		revealMines();
	};
};

function resetGame() {
	tilesClicked = 0;
	// mines = difficulty == "Beginner" ? 10 : difficulty == "Intermediate" ? 40 : 99;
	minesLeft = mines
	minesLocation = [];
	boardHTML.innerHTML = "";
	smileyFace.classList.remove("face-win_", "face-lose_");
	gameStarted = false;
	setTimeout(() => Array.from(timerHTML.children).forEach(e => e.dataset.number = "zero_"), 1000);
	loadBoard();
};

function placeFlag(e, tile = this) {
	if (e !== null) {
		// For the right click.
		e.preventDefault();
	};

	if (tile.dataset.flagged == "false" && !tile.classList.contains("clicked_")) {
		tile.classList.add("flagged_");
		tile.dataset.flagged = "flagged";
		
		minesLeft -= 1;
	} else if (tile.dataset.flagged == "flagged") {
		tile.classList.remove("flagged_");
		tile.classList.add("question-mark_");
		tile.dataset.flagged = "question-mark";
		
		minesLeft += 1;
	} else if (tile.dataset.flagged == "question-mark") {
		tile.classList.remove("question-mark_");
		tile.dataset.flagged = false;
	};

	minesCounter.innerText = minesLeft;
	return;
};

function startTimer() {
	let time = "000";
	let increment = 0;

	let timer = setInterval(() => {
		increment++;

		if (increment < 10) {
			time = `00${increment}`;
		} else if (increment < 100) {
			time = `0${increment}`;
		} else if (increment < 1000) {
			time = increment;
		};
		
		// Add dataset to element & update HTML.
		const leftDigit = toWord(time.split("")[0]);
		const leftDigitHTML = document.querySelector("._timer .left_");
		leftDigitHTML.dataset.number = `${leftDigit}_`;

		const middleDigit = toWord(time.split("")[1]);
		const middleDigitHTML = document.querySelector("._timer .middle_");
		middleDigitHTML.dataset.number = `${middleDigit}_`;

		const rightDigit = toWord(time.split("")[2]);
		const rightDigitHTML = document.querySelector("._timer .right_");
		rightDigitHTML.dataset.number = `${rightDigit}_`;

		if (!gameStarted || increment == 999) {
			clearInterval(timer);
		};

	}, 1000);
};

function toWord(number) {
	const numberAsWord = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
	return numberAsWord[number];
};

function faceWhenHold() {
	smileyFace.classList.add("face-o_");
};

function faceWhenReleaseHold() {
	smileyFace.classList.remove("face-o_");
};

function holdEffect(element, className) {
	element.addEventListener("mousedown", (e) => {
		if (className == "hold_") faceWhenHold();
		if (e.buttons == 1 || e.buttons == 3) {
			element.classList.add(className);
		};
	});
	element.addEventListener("mouseover", (e) => {
		if (e.buttons == 1 || e.buttons == 3) {
			element.classList.add(className);
		};
	});
	element.addEventListener("mouseup",() => {
		if (className == "hold_") faceWhenReleaseHold();
		element.classList.remove(className)
	});
	element.addEventListener("mouseout", () => element.classList.remove(className));
};

holdEffect(smileyFace, "face-hold_");
smileyFace.addEventListener("click", resetGame);
difficultyButtons.forEach(button => button.addEventListener("click", difficultySet));

document.addEventListener("DOMContentLoaded", () => {
	loadBoard();
});