# Game of Life

*A small proof of concept of Conway's Game of Life, in javascript.*


## About

The Game of Life implemented here is generic, in that custom rules and neighbourhoods may be given. It only assumes two things:
- A cell change of status only depends on (its status and) the number of its live neighbours;
- Unless manually added, a cell cannot become alive without at least one of its neighbours being alive.

The code here uses dictionaries, in order to access and add cells in amortized O(1), while using less memory than storing them in a simpler array/matrix, which would make RAM usage dependent on the distance between live cells. Concretely, used RAM should be roughly proportional to the number of live cells, and the extra memory used can be freed periodically.


## Remarks

- Cells change of status do not depend on the order in which they are parsed - they evolve simultaneously.
- One cannot remove a dead cell from the dictionary in the midst of an epoch, even if none of its neighbours are alive, for some of them may become alive later in the same epoch, thus potentially allowing the lone cell to live.
- A cell is stored as a pair (key, value), where the key is the cell 2D coordinates (as a string), and the value is the cell status, stored as a boolean.
- Printing the live cells contained in an arbitrary window, is done using the method ``` game.createGrid(x, y, width, height) ```.
- Be careful to not manually set a cell to life or death by doing ``` cells[coord] = ... ```, as this will mess up the cells count and not consider the cell neighbourhood! Use the ``` game.setCell(x, y, status) ``` method instead.


## Try it

Just open the ``` index.html ``` file with any web browser.


## Credits

Logo from <https://en.wikipedia.org>
