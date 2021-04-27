"use strict";

//////////////////////////////////////////////////
// Rules:

// Standard rules from Conway, governing the life and death of a cell,
// knowing its status and the number of live neighbour cells.
function rules_Conway(status, count) {
	if (status == Status.Live && (count < 2 || count > 3)) { // cell dies.
		return StatusChange.Death;
	}
	else if (status == Status.Dead && count == 3) { // cell lives!
		return StatusChange.Birth;
	}
	return StatusChange.None; // cell doesn't change.
}

// Custom rules, from Advent of Code:
function rules_custom(status, count) {
	if (status == Status.Live && (count == 0 || count > 2)) {
		return StatusChange.Death;
	}
	else if (status == Status.Dead && count == 2) {
		return StatusChange.Birth;
	}
	return StatusChange.None;
}

//////////////////////////////////////////////////
// Neighbourhoods:
// Note: although not necessary, defining the neighbourhoods using Key() yields significant speed gains.

// Standard 8 cells neighbourhood from a 3x3 square:
function neighboursKeys_3x3(x, y) {
	return [Key(x-1, y-1), Key(x, y-1), Key(x+1, y-1), Key(x-1, y), Key(x+1, y), Key(x-1, y+1), Key(x, y+1), Key(x+1, y+1)];
}

// Hexagonal neighbourhood, mapped to a regular grid:
function neighboursKeys_hex(x, y) {
	return [Key(x, y-1), Key(x+1, y-1), Key(x-1, y), Key(x+1, y), Key(x-1, y+1), Key(x, y+1)];
}

//////////////////////////////////////////////////
// Some cells layouts:

function addPentaDecathlon(game) { // period 15
	for (let row = 0; row < 3; ++row) {
		for (let col = 0; col < 8; ++col) {
			game.addCell([col, row]);
		}
	}

	game.cells[Key(1, 1)] = false;
	game.cells[Key(1, 6)] = false;
}

function addCluster(game) { // useful for benchmarks
	game.addCell([2, -3]);
	game.addCell([1, -2]);
	game.addCell([3, -3]);
	game.addCell([-3, 3]);
	game.addCell([-1, 0]);
	game.addCell([-1, -1]);
	game.addCell([0, -2]);
	game.addCell([0, 0]);
	game.addCell([2, 0]);
	game.addCell([0, 2]);
}
