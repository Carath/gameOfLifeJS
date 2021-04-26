//////////////////////////////////////////////////
// Generic functions:

// The coordinates key. Actually, it works to just pass the coord as is,
// but this is cleaner, and faster!
function key(x, y): string {
  return x.toString() + "," + y.toString();
}

function coordFromKey(key): number[] {
  let idx = key.indexOf(",");
  return [Number(key.substring(0, idx)), Number(key.substring(idx + 1))];
}

// 'coord' format is [x, y] i.e [col, row]:
function addCell(cells, coord: number[]) {
  let neighbours = neighboursKeys(coord[0], coord[1]);
  activate(cells, key(coord[0], coord[1]), neighbours);
}

function isAlive(cells, key: string): boolean {
  return key in cells && cells[key];
}

function countAliveCells(cells): number {
  return countAliveFromKeys(cells, Object.keys(cells));
}

function countAliveFromKeys(cells, keyList: string[]): number {
  let count = 0;
  for (let i in keyList) {
    if (isAlive(cells, keyList[i])) {
      ++count;
    }
  }
  return count;
}

function activate(cells, key: string, neighbours) {
  cells[key] = true;
  for (let i in neighbours) {
    if (!(neighbours[i] in cells)) {
      cells[neighbours[i]] = false;
    }
  }
}

function updateCell(
  cells,
  key: string,
  status: boolean,
  count: number,
  neighbours
) {
  let r = rules(status, count);
  if (r == -1) {
    // cell goes dead. Do not remove it!
    cells[key] = false;
  } else if (r == 1) {
    // cell goes live.
    activate(cells, key, neighbours);
  }
}

function cleanupCell(
  cells,
  key: string,
  status: boolean,
  count: number,
  neighbours
) {
  if (!status && count == 0) {
    delete cells[key];
  }
}

// Removing totally dead cells. This _cannot_ be done while updating the cells
// without creating side effects. Also, note that this is somewhate expensive,
// better do it only once in a while to free memory:
function cleanup(cells) {
  let size = Object.keys(cells).length;
  apply(cells, cleanupCell);
  console.log("Freed", size - Object.keys(cells).length, "cells.");
}

// Apply an action simultaneously on each cell, without side effects:

// sympa mais c'est quoi une action ?

function apply(cells, action) {
  let cellsCopy = { ...cells }; // deep copy.
  for (let key in cellsCopy) {
    let coord = coordFromKey(key);
    let neighbours = neighboursKeys(coord[0], coord[1]);
    let status = isAlive(cellsCopy, key);
    let count = countAliveFromKeys(cellsCopy, neighbours);
    action(cells, key, status, count, neighbours);
  }
}

async function run(
  cells,
  epochsNumber: number,
  cleanupCooldown: number,
  drawingFunction = null
) {
  let isRunning = true;
  for (let epoch = 0; !stop && epoch < epochsNumber; ++epoch) {
    if (epoch % cleanupCooldown == 0) {
      cleanup(cells);
    }
    if (drawingFunction != null) {
      await drawingFunction(cells, epoch);
    }
    apply(cells, updateCell);
  }
  cleanup(cells);
  if (!stop && drawingFunction != null) {
    await drawingFunction(cells, epochsNumber);
  }
  isRunning = false;
}

//////////////////////////////////////////////////
// Problem dependant:

// Standard rules from Conway, governing the life and death of a cell,
// knowing its status and the number of alive neighbour cells.
function rules(status: boolean, count: number): -1 | 1 | 0 {
  if (status && (count < 2 || count > 3)) {
    // cell dies.
    return -1;
  } else if (!status && count == 3) {
    // cell lives!
    return 1;
  }
  return 0; // cell doesn't change.
}

// Accelerated thanks to key():
function neighboursKeys(x: number, y: number): string[] {
  // Standard 8 cells neighbourhood from a 3x3 square:
  return [
    key(x - 1, y - 1),
    key(x, y - 1),
    key(x + 1, y - 1),
    key(x - 1, y),
    key(x + 1, y),
    key(x - 1, y + 1),
    key(x, y + 1),
    key(x + 1, y + 1),
  ];

  // Hexagonal neighbourhood, mapped to a regular grid:
  // return [key(x, y-1), key(x+1, y-1), key(x-1, y), key(x+1, y), key(x-1, y+1), key(x, y+1)];
}

//////////////////////////////////////////////////
// Printing:

// Filling a grid with live cells from a rectangle starting from the top left corner (x, y):
function createGrid(
  cells,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // Initializing the grid:
  let grid = new Array(height).fill(".");
  for (let i = 0; i < height; ++i) {
    grid[i] = new Array(width).fill(".");
  }
  // Filling the grid with live cells:
  for (let key in cells) {
    if (cells[key]) {
      let coord = coordFromKey(key);
      let col = coord[0] - x,
        row = coord[1] - y;
      if (0 <= row && row < height && 0 <= col && col < width) {
        grid[row][col] = "#";
      }
    }
  }
  return grid;
}

function stringOfGrid(grid) {
  let str = "";
  for (let i in grid) {
    str += grid[i].join("") + "\n";
  }
  return str;
}

function preview(cells, epoch): void {
  console.log("Epoch:", epoch);
  let grid = createGrid(cells, -20, -20, 40, 40);
  console.log(stringOfGrid(grid));
}
