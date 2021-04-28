"use strict";

const Status = {
	Dead: false,
	Live: true
};

const StatusChange = {
	Death: 0,
	Birth: 1,
	None: 2
};

// To prevent several games from running simultaneously:
var isRunning = false;
var stop = false;

class Game {
	constructor(rules, neighboursKeys, drawing, maxEpoch, cleanupCooldown=50, bound=0) {
		this.cells = {};
		this.epoch = 0;
		this.maxEpoch = maxEpoch;
		this.cleanupCooldown = cleanupCooldown;
		this.liveCellsNumber = 0;
		this.origin = [0, 0];
		this.bound = bound; // when > 0, prevents cells to live farther than this bound from 'this.origin'.

		// User given functions:
		this.rules = rules;
		this.neighboursKeys = neighboursKeys;
		this.drawing = drawing;
	}

	//////////////////////////////////////////////////
	// Public methods:

	async run() {
		isRunning = true;
		while (! stop && this.epoch < this.maxEpoch) {
			if (this.epoch % this.cleanupCooldown == 0) {
				this._cleanup();
			}
			if (this.drawing != null) {
				await this.drawing(this);
			}
			this._apply((k, s, c, n) => this._updateCell(k, s, c, n));
			++this.epoch;
		}
		this._cleanup();
		if (! stop && this.drawing != null) {
			await this.drawing(this);
		}
		isRunning = false;
	}

	setCell(x, y, status) { // (x, y) <=> (col, row)
		let key = Key(x, y);
		let currentStatus = this._getStatus(this.cells, key);
		if (status == Status.Dead && currentStatus == Status.Live) {
			this.cells[key] = Status.Dead;
			--this.liveCellsNumber;
		}
		else if (status == Status.Live && currentStatus != Status.Live) {
			this._activate(key, this.neighboursKeys(x, y));
		}
	}

	// Number of stored keys. Computed in O(1).
	mapSize() {
		return Object.keys(this.cells).length;
	}

	// Filling a grid with live cells from a rectangle starting from the top left corner (x, y):
	createGrid(x, y, width, height) {
		// Initializing the grid:
		let grid = new Array(height).fill('.');
		for (let i = 0; i < height; ++i) {
			grid[i] = new Array(width).fill('.');
		}
		// Filling the grid with live cells:
		for (let key in this.cells) {
			if (this.cells[key]) {
				let coord = coordFromKey(key);
				let col = coord[0] - x, row = coord[1] - y;
				if (0 <= row && row < height && 0 <= col && col < width) {
					grid[row][col] = '#';
				}
			}
		}
		return grid;
	}

	//////////////////////////////////////////////////
	// Private methods:

	_getStatus(usedCells, key) { // usedCells may be != this.cells!
		return key in usedCells ? usedCells[key] : Status.Dead;
	}

	_countAliveFromKeys(usedCells, keyList) { // usedCells may be != this.cells!
		let count = 0;
		for (let i = 0; i < keyList.length; ++i) {
			if (this._getStatus(usedCells, keyList[i]) == Status.Live) {
				++count;
			}
		}
		return count;
	}

	_activate(key, neighbours) {
		if (this.bound > 0) {
			let coord = coordFromKey(key);
			if (Math.abs(coord[0] - this.origin[0]) > this.bound ||
				Math.abs(coord[1] - this.origin[1]) > this.bound) {
				return;
			}
		}
		this.cells[key] = Status.Live;
		++this.liveCellsNumber;
		for (let i = 0; i < neighbours.length; ++i) {
			if (! (neighbours[i] in this.cells)) {
				this.cells[neighbours[i]] = Status.Dead;
			}
		}
	}

	_updateCell(key, status, count, neighbours) {
		let r = this.rules(status, count);
		if (r == StatusChange.Death) { // cell dies, but do not remove it!
			this.cells[key] = Status.Dead;
			--this.liveCellsNumber;
		}
		else if (r == StatusChange.Birth) { // cell goes live.
			this._activate(key, neighbours);
		}
	}

	_cleanupCell(key, status, count, neighbours) {
		if (status == Status.Dead && count == 0) {
			delete this.cells[key];
		}
	}

	// Removing totally dead cells. This _cannot_ be done while updating the cells
	// without creating side effects. Also, note that this is somewhate expensive,
	// better do it only once in a while to free memory:
	_cleanup() {
		let size = this.mapSize();
		this._apply((k, s, c, n) => this._cleanupCell(k, s, c, n));
		console.log("Freed", size - this.mapSize(), "cells.");
	}

	// Apply an action simultaneously on each cell, without side effects:
	_apply(action) {
		let cellsCopy = {...this.cells}; // 1st level copy.
		for (let key in cellsCopy) {
			let coord = coordFromKey(key);
			let neighbours = this.neighboursKeys(coord[0], coord[1]);
			let status = this._getStatus(cellsCopy, key);
			let count = this._countAliveFromKeys(cellsCopy, neighbours);
			action(key, status, count, neighbours);
		}
	}
}

//////////////////////////////////////////////////
// Utilities:

// The coordinates key, which is a string. Actually, it works to just
// pass the coord as is, but this is cleaner, and faster!
function Key(x, y) {
	return x.toString() + ',' + y.toString(); // comma necessary: (1, 23) vs (12, 3)
}

function coordFromKey(key) {
	let idx = key.indexOf(',');
	return [Number(key.substring(0, idx)), Number(key.substring(idx + 1))];
}

function stringOfGrid(grid) {
	let str = "";
	for (let i in grid) {
		str += grid[i].join("") + '\n';
	}
	return str;
}

function preview(game) {
	console.log("Epoch:", game.epoch);
	let grid = game.createGrid(-20, -20, 40, 30);
	console.log(stringOfGrid(grid));
}
