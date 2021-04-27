"use strict";

//////////////////////////////////////////////////
// Benchmarking:

function benchmark() {
	let t0 = performance.now();
	let maxEpoch = 50;
	let drawing = null;
	// let drawing = preview; // draws in the console.

	let game = new Game(rules_custom, neighboursKeys_hex, drawing, maxEpoch);
	addCluster(game);
	game.run();

	let t1 = performance.now();
	let elapsedTime = (t1 - t0) / 1000.; // in sec
	textArea.value = "Epoch " + game.epoch + ":\n";
	textArea.value += "Live cells: " + game.liveCellsNumber + "\n";
	textArea.value += "Elapsed time: " + elapsedTime + " s";
	// No killing previous runs here...
}

//////////////////////////////////////////////////
// Animation:

const animationCooldown = 500; // in ms
var textArea = null;

window.onload = function() {
	const restartButton = document.getElementById("restartButton");
	textArea = document.getElementById("myTextArea");
	textArea.value = "";

	restartButton.addEventListener('click', function() {
		let maxEpoch = 30;
		let game = new Game(rules_Conway, neighboursKeys_3x3, draw, maxEpoch);
		addPentaDecathlon(game);
		animation(game);
	}, false);

	// benchmark(); // runs on page load.
}

async function animation(game) {
	if (isRunning) {
		stop = true;
		console.log("An animation is already running, waiting for it to stop...");
		window.setTimeout(animation, animationCooldown / 2);
	} else {
		stop = false;
		game.run();
	}
}

async function draw(game) {
	textArea.value = "Epoch " + game.epoch + ":\n";
	textArea.value += "Live cells: " + game.liveCellsNumber + "\n";
	let grid = game.createGrid(-10, -10, 35, 25);
	textArea.value += stringOfGrid(grid);
	await sleep(animationCooldown);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
