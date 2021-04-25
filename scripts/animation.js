//////////////////////////////////////////////////
// Testing:

function initCells() {
	// Penta-decathlon (period 15):
	cells = {};
	for (let row = 0; row < 3; ++row) {
		for (let col = 0; col < 8; ++col) {
			addCell(cells, [col, row]);
		}
	}

	cells[key(1, 1)] = false;
	cells[key(1, 6)] = false;

	// console.log(cells);
	return cells;
}

function verify() {
	let epochsNumber = 30;
	let cleanupCooldown = 50;

	let cells = initCells();
	console.log("Alive cells number:", countAliveCells(cells));
	let t0 = performance.now();

	run(cells, epochsNumber, cleanupCooldown);
	// run(cells, epochsNumber, cleanupCooldown, preview);

	console.log("Alive cells number:", countAliveCells(cells));
	let t1 = performance.now();
	console.log("Elapsed time:", (t1 - t0) / 1000., "s");
}

//////////////////////////////////////////////////
// Animation:

const animationCooldown = 500; // in ms
var isRunning = false;
var stop = false;
var textArea = null;

window.onload = function() {
	// verify(); // OK!

	const restartButton = document.getElementById("restartButton");
	textArea = document.getElementById("myTextArea");
	textArea.value = "";
	restartButton.addEventListener('click', function() {
		animation();
	}, false);
}

async function animation() {
	if (isRunning) {
		stop = true;
		console.log("An animation is already running, waiting for it to stop...");
		window.setTimeout(animation, animationCooldown / 2);
	} else {
		stop = false;
		let epochsNumber = 30;
		let cleanupCooldown = 50;
		let cells = initCells();
		run(cells, epochsNumber, cleanupCooldown, draw);
	}
}

async function draw(cells, epoch) {
	textArea.value = "Epoch " + epoch + ":\n";
	textArea.value += "Alive cells number: " + countAliveCells(cells) + "\n";
	let grid = createGrid(cells, -10, -10, 35, 25);
	textArea.value += stringOfGrid(grid);
	await sleep(animationCooldown);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
