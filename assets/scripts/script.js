let board = [];
let tilesClicked = 0;

let gameRow = 9;
let gameColumn = 9;

let mines = 10;
let minesLeft = mines;
let minesLocation = [];

let gameStarted = false;
let difficulty = "Beginner";

let timerId;

// HTML.
const boardHTML = document.querySelector(".__board");
const timerHTML = document.querySelector("._timer");
const smileyFace = document.querySelector("._smiley-face");

const gameTabButton = document.querySelector(".__game ._game-text");
const helpTabButton = document.querySelector(".__help ._help-text");

const newGameButton = document.querySelector(".new-game_");
const difficultyButtons = {
	beginnerButton: document.querySelector(".beginner_"),
	intermediateButton: document.querySelector(".intermediate_"),
	expertButton: document.querySelector(".expert_"),
	customButton: document.querySelector(".custom_")
};

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

	updateDigit("._mines-count", minesLeft);
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

function difficultySet(button, custom) {
	difficulty = button.dataset.difficulty;

	// Update checkmark.
	Object.keys(difficultyButtons).forEach(button => difficultyButtons[button].querySelector("img").dataset.checked = "false");
	button.querySelector("img").dataset.checked = "true";

	if (difficulty == "Beginner") {
		gameRow = 9;
		gameColumn = 9;
		mines = 10;
	} else if (difficulty == "Intermediate") {
		gameRow = 16;
		gameColumn = 16;
		mines = 40;
	} else if (difficulty == "Expert") {
		gameRow = 16;
		gameColumn = 30;
		mines = 99;
	} else if (difficulty == "Custom") {
		gameRow = custom.width;
		gameColumn = custom.height;
		mines = custom.mines;
	};

	document.querySelector("#window").style.width = `calc((1rem * ${gameColumn}) + (0.188rem * 2.99) + (0.313rem * 4)`;
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

	clearInterval(timerId);
};

function winGame() {
	if (tilesClicked == gameRow * gameColumn - mines) {
		gameStarted = false;

		boardHTML.childNodes.forEach(t => t.style.pointerEvents = "none");
		smileyFace.classList.add("face-win_");

		clearInterval(timerId);
		revealMines();
	};
};

function resetGame() {
	tilesClicked = 0;
	minesLeft = mines;
	minesLocation = [];
	boardHTML.innerHTML = "";
	smileyFace.classList.remove("face-win_", "face-lose_");
	gameStarted = false;
	Array.from(timerHTML.children).forEach(e => e.dataset.number = "zero_");

	clearInterval(timerId);
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

	updateDigit("._mines-count", minesLeft);

	return;
};

function startTimer() {
	let time = "000";
	let increment = 0;

	timerId = setInterval(() => {
		increment++;

		if (increment < 10) {
			time = `00${increment}`;
		} else if (increment < 100) {
			time = `0${increment}`;
		} else if (increment < 1000) {
			time = increment;
		};
		
		updateDigit("._timer", increment);

		if (!gameStarted || increment == 999) {
			clearInterval(timerId);
		};

	}, 1000);
};

function updateDigit(element, someVariable) {
	let digit;

	if (someVariable < 10) {
		digit = `00${someVariable}`;
	} else if (someVariable < 100) {
		digit = `0${someVariable}`;
	} else if (someVariable < 1000) {
		digit = someVariable.toString();
	};

	const leftDigit = toWord(digit.split("")[0]);
	const leftDigitHTML = document.querySelector(`${element} .left_`);
	leftDigitHTML.dataset.number = `${leftDigit}_`;

	const middleDigit = toWord(digit.split("")[1]);
	const middleDigitHTML = document.querySelector(`${element} .middle_`);
	middleDigitHTML.dataset.number = `${middleDigit}_`;

	const rightDigit = toWord(digit.split("")[2]);
	const rightDigitHTML = document.querySelector(`${element} .right_`);
	rightDigitHTML.dataset.number = `${rightDigit}_`;
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

function openTab(tab) {
	tab.parentElement.querySelector("._options").classList.toggle("active_");
	tab.classList.toggle("active-tab_");
};

function getCustomValue() {
	do {
		var width = parseInt(window.prompt("Width (Max: 30 min: 9):", ""), 10);
	} while (isNaN(width) || width > 30 || width < 9);

	do {
		var height = parseInt(window.prompt("Height (Max: 24 min: 9):", ""), 10);
	} while (isNaN(height) || height > 24 || height < 9);

	do {
		var mines = parseInt(window.prompt("Mines (Max: 667 min: 10):", ""), 10);
	} while (isNaN(mines) || mines > 667 || mines < 10);

	return {width, height, mines};
};

smileyFace.addEventListener("click", resetGame);

gameTabButton.addEventListener("click", () => openTab(gameTabButton));
helpTabButton.addEventListener("click", () => openTab(helpTabButton));

newGameButton.addEventListener("click", () => {
	resetGame();
	openTab(gameTabButton);
});
Object.keys(difficultyButtons).forEach(button => {
	difficultyButtons[button].addEventListener("click", () => {
		if (button == "customButton") {
			difficultySet(difficultyButtons.customButton, getCustomValue());
			return;
		};

		difficultySet(difficultyButtons[button]);
		openTab(gameTabButton);
	});
});

// Close tab if clicked outside.
document.addEventListener("click", (e) => {
	if (e.target != gameTabButton && e.target != document.querySelector("._options") && e.target != document.querySelector(".separator_") && e.target != gameTabButton.querySelector("u") && gameTabButton.classList.contains("active-tab_")) {
		openTab(gameTabButton);
	};

	if (e.target != helpTabButton && e.target != document.querySelector("._options") && e.target != document.querySelector(".separator_") && e.target != helpTabButton.querySelector("u") && helpTabButton.classList.contains("active-tab_")) {
		openTab(helpTabButton);
	};
});

// F2 to restart.
document.addEventListener('keyup', (e) => {if (e.code == "F2") resetGame()});

document.addEventListener("DOMContentLoaded", () => {
	loadBoard();
	holdEffect(smileyFace, "face-hold_");
});