// gol.js
// (TODO: gol.js website here)
// (c) 2014 Max Hubenthal
// Gol may be freely distributed under the MIT license.

// Wrap the library in an IIFE
(function(window){ 
  // Declare gol object for use in global namespace
  var gol = {
      
    // Current version.
    VERSION: "1.0"
  };

  /////////////////////////////////////////////
  //  gol constants & gol setup
  /////////////////////////////////////////////

  // References to <canvas> element
  // Note: for gol to work, set the id of the <canvas>
  //   element to "gol_canvas".
  var gol_canvas = document.getElementById("gol_canvas");
  var gol_ctx = gol_canvas.getContext('2d');   

  // Use two boards, one for current gol, one to hold next gol
  var gol_lifeBoard1 = [], gol_lifeBoard2 = [];
    
  // Set flag to start gol at board one
  var gol_board1isCurrent = true;
  // Set default gol board and cell sizes and colors, and interval for speed of life
  // (Grid lines are drawn at 1px wide)
  var gol_backgroundColor = "black", gol_backgroundWidth, gol_backgroundHeight, gol_boardCellHeight = 30, gol_boardCellWidth = 60, gol_cellSize = 10, gol_cellColor = "white", gol_lifeSpeed = 250, gol_intervalId;
  // Set offset values for gol origin
  var gol_originX = 0, gol_originY = 0;
  // Set default canvas size
  gol_backgroundWidth = ((gol_boardCellWidth*gol_cellSize)+gol_boardCellWidth+1);
  gol_backgroundHeight = ((gol_boardCellHeight*gol_cellSize)+gol_boardCellHeight+1);
  gol_canvas.width = gol_backgroundWidth;
  gol_canvas.height = gol_backgroundHeight;

  // Set default values for state of board
  var gol_isPaused = true;

  /////////////////////////////////////////////
  //  Internal gol functions
  /////////////////////////////////////////////

  // Draw black rectangle container, size of life board
  function gol_drawBackground(){
    gol_ctx.fillStyle = gol_backgroundColor;
    gol_ctx.fillRect(gol_originX,gol_originY,gol_backgroundWidth,gol_backgroundHeight);
  }

  // Draw complete board of dead(white) cells
  function gol_drawEmptyLife(){
    gol_ctx.fillStyle = gol_cellColor;
    for(var xPos=1;xPos<gol_backgroundWidth;xPos+=(gol_cellSize+1)){
      for(var yPos=1;yPos<gol_backgroundHeight;yPos+=(gol_cellSize+1)){
        gol_ctx.fillRect(xPos,yPos,gol_cellSize,gol_cellSize);
      }
    }
  }

  // Draw current board of life
  function gol_drawLife(){
    var x=0, y=0;
    var xPos = 1, yPos = 1;
    // Use board1 if current
    if(gol_board1isCurrent){
      for(xPos=1;xPos<gol_backgroundWidth;xPos+=(gol_cellSize+1)){
        y=0;
        for(yPos=1;yPos<gol_backgroundHeight;yPos+=(gol_cellSize+1)){
          // Dead cell
          if(gol_lifeBoard1[y][x] === 0){
            gol_ctx.fillStyle = gol_cellColor;
            gol_ctx.fillRect(xPos,yPos,gol_cellSize,gol_cellSize);
          } 
          // Else live cell
          if(gol_lifeBoard1[y][x] === 1){
            gol_ctx.fillStyle = gol_backgroundColor;
            gol_ctx.fillRect(xPos,yPos,gol_cellSize,gol_cellSize);
          }
          y++;
        }
        x++;
      }
    } 
    // Else, board2 is current 
    if(!gol_board1isCurrent){
      for(xPos=1;xPos<gol_backgroundWidth;xPos+=(gol_cellSize+1)){
        y=0;
        for(yPos=1;yPos<gol_backgroundHeight;yPos+=(gol_cellSize+1)){
          // Dead cell
          if(gol_lifeBoard2[y][x] === 0){
            gol_ctx.fillStyle = gol_cellColor;
            gol_ctx.fillRect(xPos,yPos,gol_cellSize,gol_cellSize);
          } 
          // Else live cell
          if(gol_lifeBoard2[y][x] === 1){
            gol_ctx.fillStyle = gol_backgroundColor;
            gol_ctx.fillRect(xPos,yPos,gol_cellSize,gol_cellSize);
          }
          y++;
        }
        x++;
      }
    }
  } 

  // Draw complete empty board
  function gol_drawEmptyBoard(){
    gol_drawBackground();
    gol_drawEmptyLife();
  }

  // Set both life boards to all dead ("0" values)
  function gol_clearLife(boardToClear){
    for(var yPos=0;yPos<gol_boardCellHeight;yPos++){
      boardToClear[yPos] = [];
      for(var xPos=0;xPos<gol_boardCellWidth;xPos++){
        boardToClear[yPos][xPos] = 0;
      }
    }
  }

  // Get number of live neighbors, looking at the grid as a toroidal sphere
  function gol_getNeighborCount(array,y,x){
    var liveNabes = 0;
    // Check north
    function checkNorth(){
      if(y===0){
        liveNabes += array.slice(y-1)[0][x];
      }
      if(y!==0){
        liveNabes += array.slice(y-1,y)[0][x];
      } 
    }
    // Check south
    function checkSouth(){
      if(y===array.length-1){
        liveNabes += array.slice(0,1)[0][x];
      }
      if(y!==array.length-1){
        liveNabes += array.slice(y+1,y+2)[0][x];
      }
    } 
    // Check west
    function checkWest(){
      if(x===0){
        liveNabes += array[y][array[0].length-1];
      }
      if(x!==0){
        liveNabes += array[y][x-1];
      } 
    } 
    // Check east
    function checkEast(){
      if(x===array[0].length-1){
        liveNabes += array[y][0];
      }
      if(x!==array[0].length-1){
        liveNabes += array[y][x+1];
      }  
    }
    // Check northwest
    function checkNorthwest(){
      if(y===0 && x!==0){
        liveNabes += array.slice(y-1)[0][x-1];
      }
      if(y!==0 && x!==0){
        liveNabes += array[y-1][x-1];
      } 
      if(y===0 && x===0){
        liveNabes += array[array.length-1][array[0].length-1];
      }
      if(y!==0 && x===0){
        liveNabes += array[y-1][array[0].length-1];
      } 
    }
    // Check northeast
    function checkNortheast(){
      if(y===0 && x!==array[0].length-1){
        liveNabes += array[array.length-1][x+1];
      }
      if(y!==0 && x!==array[0].length-1){
        liveNabes += array[y-1][x+1];
      } 
      if(y===0 && x===array[0].length-1){
        liveNabes += array[array.length-1][0];
      }
      if(y!==0 && x===array[0].length-1){
        liveNabes += array[y-1][0];
      } 
    }
    // Check southwest
    function checkSouthwest(){
      if(y!==array.length-1 && x!==0){
        liveNabes += array[y+1][x-1];
      }
      if(y!==array.length-1 && x===0){
        liveNabes += array[y+1][array[0].length-1];
      } 
      if(y===array.length-1 && x===array[0].length-1){
        liveNabes += array[0][array[0].length-1];
      }
      if(y===array.length-1 && x!==0){
        liveNabes += array[0][x-1];
      }
    }
    // Check southeast
    function checkSoutheast(){
      if(y!==array.length-1 && x!==array[0].length-1){
        liveNabes += array[y+1][x+1];
      }
      if(y!==array.length-1 && x===array[0].length-1){
        liveNabes += array[y+1][0];
      }
      if(y===array.length-1 && x===array[0].length-1){
        liveNabes += array[0][0];
      }
      if(y===array.length-1 && x!==array[0].length-1){
        liveNabes += array[0][x+1];
      }
    }
    // Check cardinal directions
    checkNorth();
    checkSouth();
    checkWest();
    checkEast();
    checkNorthwest();
    checkNortheast();
    checkSouthwest();
    checkSoutheast();
    return liveNabes;
  }

  // Set the next board's cell value to 1 or 0
  // based on number of neighbors.
  function gol_setNextGen(currentBoard,nextBoard,n,y,x){
    // Check if current cell is live
    if(currentBoard[y][x]===1){
      if((n>3)||(n<2)){
        nextBoard[y][x] = 0; // Set next board to dead cell
      }
      if((n===3)||(n===2)){
        nextBoard[y][x] = 1; // Set next board to live cell
      }
    }
    // Else cell is dead
    if(currentBoard[y][x]===0){
      if(n===3){
        nextBoard[y][x] = 1; // Set next board to live cell
      }
      if(n!==3){
        nextBoard[y][x] = 0; // Set next board to dead cell
      }
    }
  }

  // Check current board agains rules for Conway's
  // game of life and change next board accordingly.
  //    Conway's Game of Life rules (Wikipedia):
  //      1. Any live cell with fewer than two live neighbors dies, as if caused by under-population.
  //      2. Any live cell with two or three live neighbors lives on to the next generation.
  //      3. Any live cell with more than three live neighbors dies, as if by overcrowding.
  //      4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
  function gol_checkBoard(){
    // N holds number of live neighbors of current cell
    var n = 0;
    var xPos = 0, yPos = 0;
    // Check which board is current
    // Board 1 is current
    if(gol_board1isCurrent){
      for(xPos=0;xPos<gol_boardCellWidth;xPos++){
        for(yPos=0;yPos<gol_boardCellHeight;yPos++){
          n = 0;
          n = gol_getNeighborCount(gol_lifeBoard1, yPos, xPos);
          gol_setNextGen(gol_lifeBoard1,gol_lifeBoard2,n,yPos,xPos);
        }
      }
      gol_clearLife(gol_lifeBoard1);
    }
    // Else board 2 is current
    if(!gol_board1isCurrent){
      for(xPos=0;xPos<gol_boardCellWidth;xPos++){
        for(yPos=0;yPos<gol_boardCellHeight;yPos++){
          n=0;
          n = gol_getNeighborCount(gol_lifeBoard2, yPos, xPos);
          gol_setNextGen(gol_lifeBoard2,gol_lifeBoard1,n,yPos,xPos);
        }
      }
      gol_clearLife(gol_lifeBoard2);
    }
    // Reset current board
    gol_board1isCurrent = !gol_board1isCurrent;
  }

  // Gol life loop
  function gol_playLife(){
    // If gol is not already playing, start it up
    clearInterval(gol_intervalId); // Clear any previously running gol
    gol_isPaused = false;
    gol_intervalId = setInterval(function(){
      gol_checkBoard();
      gol_drawLife();
    }, gol_lifeSpeed);  
  }

  // Pause gol
  function gol_pauseLife() {
    if(!gol_isPaused){
      clearInterval(gol_intervalId);
      gol_isPaused = true;
    }
  }

  // Callback for mousedown on gol canvas
  function gol_getPosition(event){
    var currentBoard = gol_lifeBoard1;
    if(!gol_board1isCurrent){
      currentBoard = gol_lifeBoard2;
    }
    // Get mouse position
    var x = event.pageX;
    var y = event.pageY;
    // Get x and y relative to canvas
    x -= gol_canvas.offsetLeft;
    y -= gol_canvas.offsetTop;
    // Get coordinates to paint current cell
    var adjX = Math.floor(x/(gol_cellSize+1)) * (gol_cellSize+1) + 1;
    var adjY = Math.floor(y/(gol_cellSize+1)) * (gol_cellSize+1) + 1;
    // Get position of cell in board array
    var colX = Math.floor(x/(gol_cellSize+1));
    if(x<(gol_cellSize+2)){colX=0;}
    var rowY = Math.floor(y/(gol_cellSize+1));
    if(y<(gol_cellSize+2)){rowY=0;}
    // Change selected cell to live
    if(currentBoard[rowY][colX] === 0){
      gol_ctx.fillStyle = gol_backgroundColor;
      gol_ctx.fillRect(adjX,adjY,gol_cellSize,gol_cellSize);
      currentBoard[rowY][colX] = 1;
    }
    // Change selected cell to dead
    else {
      gol_ctx.fillStyle = gol_cellColor;
      gol_ctx.fillRect(adjX,adjY,gol_cellSize,gol_cellSize);
      currentBoard[rowY][colX] = 0;
    }
  }

  /////////////////////////////////////////////
  //  External functions to be called by user
  /////////////////////////////////////////////

  // Basic gol operations
  // Setup blank board
  gol.setupLife = function(){
    gol_drawEmptyBoard();
    gol_clearLife(gol_lifeBoard1);
    gol_clearLife(gol_lifeBoard2);
    // Let user select initial live cells
    gol_canvas.addEventListener("mousedown", gol_getPosition, false);
  };
  // Play current gol board
  gol.playLife = function(){
    gol_canvas.removeEventListener("mousedown", gol_getPosition, false);
    gol_playLife();
  };
  // Pause
  gol.pauseLife = function(){
    gol_pauseLife();
    gol_canvas.addEventListener("mousedown", gol_getPosition, false);
  };
  // Reset the board
  gol.clearLife = function(){
    gol_pauseLife();
    gol_clearLife(gol_lifeBoard1);
    gol_clearLife(gol_lifeBoard2);
    gol_drawLife();
    gol_canvas.addEventListener("mousedown", gol_getPosition, false);
  };

  // Customize gol
  // Note: setSize method still needs to be implemented
  // Set board width, height
  /*
  gol.setSize = function(newCellWidth, newCellHeight){
    //gol_pauseLife();
    gol_boardCellWidth = newCellWidth;
    gol_boardCellHeight = newCellHeight;
    gol_backgroundWidth = ((gol_boardCellWidth*gol_cellSize)+gol_boardCellWidth+1);
    gol_backgroundHeight = ((gol_boardCellHeight*gol_cellSize)+gol_boardCellHeight+1);
    gol_clearLife(gol_lifeBoard1);
    gol_clearLife(gol_lifeBoard2);
    gol_drawLife(); 
  }
  */
  // Change grid color, takes a valid CSS color string, pauses game
  gol.setGridColor = function(newGridColor){
    gol_backgroundColor = newGridColor;
    if(gol_isPaused){
      gol_drawBackground();
      gol_drawLife();
    }
  };
  // Change cell color, takes a valid CSS color string, pauses game
  gol.setCellColor = function (newCellColor) {
    gol_cellColor = newCellColor;
    if(gol_isPaused){
      gol_drawLife();
    }
  };
  // Change interval in ms of lifecycles
  gol.setLifeSpeed = function(newLifeSpeed){
    gol_lifeSpeed = newLifeSpeed;
    // Keep gol running if currently running
    if(!gol_isPaused){
      gol_playLife();
    }
  };
  // Populate board with a randomly populated game of life
  gol.setSampleBoard = function(){
    gol_pauseLife();
    gol_clearLife(gol_lifeBoard1);
    gol_clearLife(gol_lifeBoard2); 
    var xPos = 0, yPos = 0; 
    // Get a random value of 1 or 0
    function getRandomCell() {
      return Math.floor(Math.random() * 2);
    }
    if(gol_board1isCurrent){
      for(yPos=10;yPos<20;yPos++){
        gol_lifeBoard1[yPos] = [];
        for(xPos=25;xPos<35;xPos++){
          gol_lifeBoard1[yPos][xPos] = getRandomCell();
        }
      }
    }
    if(!gol_board1isCurrent){
      for(yPos=10;yPos<20;yPos++){
        gol_lifeBoard2[yPos] = [];
        for(xPos=25;xPos<35;xPos++){
          gol_lifeBoard2[yPos][xPos] = getRandomCell();
        }
      }  
    }
    gol_drawLife();
  };

  // Register the gol object to the global namespace
  window.gol = gol;
}(window));

// gol2.js
// (TODO: gol2.js website here)
// (c) 2014 Max Hubenthal
// gol2 may be freely distributed under the MIT license.

// Wrap the library in an IIFE
;(function(root) { 
  // Define gol2 constructor
  // Canvas Id is required for new gol2 object, board width and height are optional,
  // and default to 60 cells wide by 30 cells tall
  var Gol2 = function(targetCanvasId, boardOptions) {      
    // Current version
    var _this = this;
    _this.version = {VERSION: "2.0"};
    // Get Canvas object by Id
    _this.gol2_canvas = document.getElementById(targetCanvasId);
    // Get Canvas element context to draw to
    _this.gol2_ctx = gol2_canvas.getContext('2d'); 
    // Set board options with custom or default values
    boardOptions = boardOptions || {};
    _this.gol2_boardCellWidth = boardOptions.boardWidth || 60;
    _this.gol2_boardCellHeight = boardOptions.boardHeight || 30;
    _this.gol2_cellSize = boardOptions.cellSize || 10;
    _this.gol2_lifeSpeed = boardOptions.lifeSpeed || 250;
    // Assign color to cell states
    _this.state0 = "rgb(255,255,255)"; // Dead cell
    _this.state1 = "rgb(255,204,204)"; // Cell alive one cycle
    _this.state2 = "rgb(255,102,102)"; // Cell alive two cycles
    _this.state3 = "rgb(255,0,0)"; // Cell alive three cycles
    _this.state4 = "rgb(153,0,0)"; // Cell alive four cycles
    _this.state5 = "rgb(51,0,0)"; // Cell alive five or more cycles
    _this.state6 = "rgb(153,255,255)"; // Cell recently dead
    // Array of colors, assigned depending on cell's state: [dead, alive 1, alive 2, alive 3, alive 4, alive 5, recently dead]
    _this.gol2_stateColors = [_this.state0, _this.state1, _this.state2, _this.state3, _this.state4, _this.state5, _this.state6];
    // Use two boards, one for current gol2, one to hold next gol2
    _this.gol2_lifeBoard1 = [];
    _this.gol2_lifeBoard2 = [];
    // Set flag to start gol2 at board one
    _this.gol2_board1isCurrent = true;
    // Default gol2 board and cell sizes and colors, and interval for speed of life
    // (Grid lines are drawn at 1px wide)
    _this.gol2_cellColor = _this.state0;
    _this.gol2_backgroundColor = _this.state5;
    _this.gol2_intervalId = 0;
    // Set offset values for gol2 origin
    _this.gol2_originX = 0;
    _this.gol2_originY = 0;
    // Set canvas size
    _this.gol2_backgroundWidth = ((_this.gol2_boardCellWidth * _this.gol2_cellSize) + _this.gol2_boardCellWidth + 1);
    _this.gol2_backgroundHeight = ((_this.gol2_boardCellHeight * _this.gol2_cellSize) + _this.gol2_boardCellHeight + 1);
    _this.gol2_canvas.width = _this.gol2_backgroundWidth;
    _this.gol2_canvas.height = _this.gol2_backgroundHeight;
    // Set default values for state of board
    _this.gol2_isPaused = true;

    /////////////////////////////////////////////
    //  Internal gol2 functions
    /////////////////////////////////////////////

    // Draw black rectangle container, size of life board
    _this.gol2_drawBackground = function() {
      _this.gol2_ctx.fillStyle = _this.gol2_backgroundColor;
      _this.gol2_ctx.fillRect(_this.gol2_originX, _this.gol2_originY, _this.gol2_backgroundWidth, _this.gol2_backgroundHeight);
    };

    // Draw complete board of dead(white) cells
    _this.gol2_drawEmptyLife = function() {
      _this.gol2_ctx.fillStyle = _this.gol2_cellColor;
      for (var xPos = 1; xPos < _this.gol2_backgroundWidth; xPos += (_this.gol2_cellSize + 1)) {
        for (var yPos = 1; yPos < _this.gol2_backgroundHeight; yPos += (_this.gol2_cellSize + 1)) {
          _this.gol2_ctx.fillRect(xPos,yPos, _this.gol2_cellSize, _this.gol2_cellSize);
        }
      }
    };

    // Draw current board of life
    _this.gol2_drawLife = function() {
      var x = 0;
      var y=0;
      var xPos = 1;
      var yPos = 1;
      // Draw life based on current board
      var currentBoard = _this.gol2_board1isCurrent ? _this.gol2_lifeBoard1 : _this.gol2_lifeBoard2;
      for (xPos = 1; xPos < _this.gol2_backgroundWidth; xPos += (_this.gol2_cellSize + 1)) {
        y = 0;
        for (yPos = 1; yPos < _this.gol2_backgroundHeight; yPos += (_this.gol2_cellSize + 1)) {
          // Fill cell based on state of cell
          _this.gol2_ctx.fillStyle = _this.gol2_stateColors[currentBoard[y][x].state];
          _this.gol2_ctx.fillRect(xPos, yPos, _this.gol2_cellSize, _this.gol2_cellSize);
          y++;
        }
        x++;
      }
    }; 

    // Draw complete empty board
    _this.gol2_drawEmptyBoard = function() {
      _this.gol2_drawBackground();
      _this.gol2_drawEmptyLife();
    };

    // Set both life boards to all dead ("0" values)
    _this.gol2_clearLife = function(boardToClear) {
      for (var yPos = 0; yPos < _this.gol2_boardCellHeight; yPos++) {
        boardToClear[yPos] = [];
        for (var xPos = 0; xPos < _this.gol2_boardCellWidth; xPos++) {
          boardToClear[yPos][xPos] = {state: 0};
        }
      }
    };

    // Get number of live neighbors, looking at the grid as a toroidal sphere
    _this.gol2_getNeighborCount = function(array, y, x) {
      var liveNabes = 0;
      function convertState(stateValue) {
        // Convert state value to 1 or 0
        return (stateValue === 0 || stateValue === 6) ? 0 : 1;
      }
      // Check north
      function checkNorth() {
        if (y === 0) {
          liveNabes += convertState(array.slice(y - 1)[0][x].state);
        }
        if (y !== 0) {
          liveNabes += convertState(array.slice(y - 1, y)[0][x].state);
        } 
      }
      // Check south
      function checkSouth() {
        if (y === array.length - 1) {
          liveNabes += convertState(array.slice(0, 1)[0][x].state);
        }
        if (y !== array.length - 1) {
          liveNabes += convertState(array.slice(y + 1, y + 2)[0][x].state);
        }
      } 
      // Check west
      function checkWest() {
        if (x === 0) {
          liveNabes += convertState(array[y][array[0].length - 1].state);
        }
        if (x !== 0) {
          liveNabes += convertState(array[y][x - 1].state);
        } 
      } 
      // Check east
      function checkEast() {
        if (x === array[0].length - 1) {
          liveNabes += convertState(array[y][0].state);
        }
        if (x !== array[0].length - 1) {
          liveNabes += convertState(array[y][x + 1].state);
        }  
      }
      // Check northwest
      function checkNorthwest() {
        if (y === 0 && x !== 0) {
          liveNabes += convertState(array.slice(y - 1)[0][x - 1].state);
        }
        if (y !== 0 && x !== 0) {
          liveNabes += convertState(array[y - 1][x - 1].state);
        } 
        if (y === 0 && x === 0) { 
          liveNabes += convertState(array[array.length - 1][array[0].length - 1].state);
        }
        if (y !== 0 && x === 0) {
          liveNabes += convertState(array[y - 1][array[0].length - 1].state);
        } 
      }
      // Check northeast
      function checkNortheast() {
        if (y === 0 && x !== array[0].length - 1) {
          liveNabes += convertState(array[array.length - 1][x + 1].state);
        }
        if (y !== 0 && x !== array[0].length - 1) {
          liveNabes += convertState(array[y - 1][x + 1].state);
        } 
        if (y === 0 && x === array[0].length - 1) {
          liveNabes += convertState(array[array.length - 1][0].state);
         }
        if (y !== 0 && x === array[0].length - 1) {
          liveNabes += convertState(array[y - 1][0].state);
        } 
      }
      // Check southwest
      function checkSouthwest() {
        if (y !== array.length - 1 && x !== 0) {
          liveNabes += convertState(array[y + 1][x - 1].state);
        }
        if (y !== array.length - 1 && x === 0) {
          liveNabes += convertState(array[y + 1][array[0].length - 1].state);
        } 
        if (y === array.length - 1 && x === array[0].length - 1) {
          liveNabes += convertState(array[0][array[0].length - 1].state);
        }
        if (y === array.length - 1 && x !== 0) {
          liveNabes += convertState(array[0][x - 1].state);
        }
      }
      // Check southeast
      function checkSoutheast() {
        if (y !== array.length - 1 && x !== array[0].length - 1) {
          liveNabes += convertState(array[y+1][x+1].state);
        }
        if (y !== array.length - 1 && x === array[0].length - 1) {
          liveNabes += convertState(array[y + 1][0].state);
        }
        if (y === array.length - 1 && x === array[0].length - 1) {
          liveNabes += convertState(array[0][0].state);
        }
        if (y === array.length - 1 && x !== array[0].length - 1) {
          liveNabes += convertState(array[0][x + 1].state);
        }
      }
      // Check cardinal directions
      checkNorth();
      checkSouth();
      checkWest();
      checkEast();
      checkNorthwest();
      checkNortheast();
      checkSouthwest();
      checkSoutheast();
      return liveNabes;
    };

    // Set the next board's cell value to 1 or 0
    // based on number of neighbors.
    _this.gol2_setNextGen = function(currentBoard, nextBoard, n, y, x) {
      // Check if current cell is live
      if (currentBoard[y][x].state >= 1) {
        if ((n > 3)||(n < 2)) {
          nextBoard[y][x].state = 6; // Set next board to recently dead cell
        }
        if ((n === 3)||(n === 2)) {
          // Cell has not reached limit
          if (currentBoard[y][x].state < 5) {
            nextBoard[y][x].state = ++currentBoard[y][x].state;
          } else {
            nextBoard[y][x].state = 5;  
          }
        }
      }
      // Else cell is dead or recently dead
      if ((currentBoard[y][x].state === 0) || (currentBoard[y][x].state === 6)) { 
        if (n === 3) {
          nextBoard[y][x].state = 1; // Set next board to live cell
        } else {
          nextBoard[y][x].state = 0; // Set next board to dead cell
        }
      }
    };

    // Check current board agains rules for Conway's
    // game of life and change next board accordingly.
    //    Conway's Game of Life rules (Wikipedia):
    //      1. Any live cell with fewer than two live neighbors dies, as if caused by under-population.
    //      2. Any live cell with two or three live neighbors lives on to the next generation.
    //      3. Any live cell with more than three live neighbors dies, as if by overcrowding.
    //      4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    _this.gol2_checkBoard = function() {
      // N holds number of live neighbors of current cell
      var n = 0;
      var xPos = 0;
      var yPos = 0;
      // Dynamically obtain current/next boards
      var currentBoard = _this.gol2_board1isCurrent ? _this.gol2_lifeBoard1 : _this.gol2_lifeBoard2;
      var nextBoard = _this.gol2_board1isCurrent ? _this.gol2_lifeBoard2 : _this.gol2_lifeBoard1;
      // Check current board, set next board
      for (xPos = 0; xPos < _this.gol2_boardCellWidth; xPos++) {
        for (yPos = 0; yPos < _this.gol2_boardCellHeight; yPos++) {
          n = 0;
          n = _this.gol2_getNeighborCount(currentBoard, yPos, xPos);
          _this.gol2_setNextGen(currentBoard, nextBoard, n, yPos, xPos);
        }
      }
      _this.gol2_clearLife(currentBoard);
      // Reset current board flag
      _this.gol2_board1isCurrent = !_this.gol2_board1isCurrent;
    };

    // gol2 life loop
    _this.gol2_playLife = function() {
      // If gol2 is not already playing, start it up
      clearInterval(_this.gol2_intervalId); // Clear any previously running gol2
      // Get reference to proper '_this' context
      var self = _this;
      self.gol2_isPaused = false;
      self.gol2_intervalId = setInterval( function() {
        self.gol2_checkBoard();
        self.gol2_drawLife();
      }, self.gol2_lifeSpeed);  
    };

    // Pause gol2
    _this.gol2_pauseLife = function() {
      if (!_this.gol2_isPaused) {
        clearInterval(_this.gol2_intervalId);
        _this.gol2_isPaused = true;
      }
    };

    // Callback for mousedown on gol2 canvas
    _this.gol2_getPosition = function(event) {
      // Get reference to proper '_this' context
      var self = _this;
      // Get current board
      var currentBoard = self.gol2_board1isCurrent ? self.gol2_lifeBoard1 : self.gol2_lifeBoard2;
      // Get mouse position
      var x = event.pageX;
      var y = event.pageY;
      // Get x and y relative to canvas
      x -= self.gol2_canvas.offsetLeft;
      y -= self.gol2_canvas.offsetTop;
      // Get coordinates to paint current cell
      var adjX = Math.floor(x / (self.gol2_cellSize + 1)) * (self.gol2_cellSize + 1) + 1;
      var adjY = Math.floor(y / (self.gol2_cellSize + 1)) * (self.gol2_cellSize + 1) + 1;
      // Get position of cell in board array
      var colX = Math.floor(x / (self.gol2_cellSize + 1));
      if (x < (self.gol2_cellSize + 2)) {colX = 0;}
      var rowY = Math.floor(y / (self.gol2_cellSize + 1));
      if (y < (self.gol2_cellSize + 2)) {rowY = 0;}
      // Change selected cell to live state 1 color
      if (currentBoard[rowY][colX].state === 0) {
        self.gol2_ctx.fillStyle = self.gol2_stateColors[1];
        self.gol2_ctx.fillRect(adjX, adjY, self.gol2_cellSize, self.gol2_cellSize);
        currentBoard[rowY][colX].state = 1;
      } else {
        self.gol2_ctx.fillStyle = self.gol2_cellColor;
        self.gol2_ctx.fillRect(adjX, adjY, self.gol2_cellSize, self.gol2_cellSize);
        currentBoard[rowY][colX].state = 0;
      }
    };
  };

  /////////////////////////////////////////////
  //  External functions to be called by user
  /////////////////////////////////////////////

  // Basic gol2 operations
  // Setup blank board
  Gol2.prototype.setupLife = function() {
    var _this = this;
    _this.gol2_drawEmptyBoard();
    _this.gol2_clearLife(_this.gol2_lifeBoard1);
    _this.gol2_clearLife(_this.gol2_lifeBoard2);
    // Let user select initial live cells
    _this.gol2_canvas.addEventListener("mousedown", _this.gol2_getPosition.bind(_this), false);
  };
  // Play current gol2 board
  Gol2.prototype.playLife = function() {
    var _this = this;
    _this.gol2_canvas.removeEventListener("mousedown", _this.gol2_getPosition.bind(_this), false);
    _this.gol2_playLife();
  };
  // Pause
  Gol2.prototype.pauseLife = function() {
    var _this = this;
    _this.gol2_pauseLife();
    _this.gol2_canvas.addEventListener("mousedown", _this.gol2_getPosition.bind(_this), false);
  };
  // Reset the board
  Gol2.prototype.clearLife = function() {
    var _this = this;
    _this.gol2_pauseLife();
    _this.gol2_clearLife(_this.gol2_lifeBoard1);
    _this.gol2_clearLife(_this.gol2_lifeBoard2);
    _this.gol2_drawLife();
    gol2_canvas.addEventListener("mousedown", _this.gol2_getPosition.bind(_this), false);
  };
  // Change interval in ms of lifecycles
  Gol2.prototype.setLifeSpeed = function(newLifeSpeed) {
    var _this = this;
    _this.gol2_lifeSpeed = newLifeSpeed;
    // Keep gol2 running if currently running
    if (!_this.gol2_isPaused) {
      _this.gol2_playLife();
    }
  };
  // Fill board with randomly populated game of life
  // Random group of cells will be centered and 
  // occupy 1/3 of the board's width and height by default
  Gol2.prototype.setSampleBoard = function() {
    var _this = this;
    _this.gol2_pauseLife();
    _this.gol2_clearLife(_this.gol2_lifeBoard1);
    _this.gol2_clearLife(_this.gol2_lifeBoard2); 
    var xPos = 0; 
    var yPos = 0; 
    // Get whole number value for 1/5 of board width, height
    var quarterBoardWidth = Math.floor(_this.gol2_boardCellWidth * .33);
    var quarterBoardHeight = Math.floor(_this.gol2_boardCellHeight * .33);
    // Get a random value of 1 or 0
    function getRandomCell() {
      return Math.floor(Math.random() * 2);
    }
    // Get current board
    var currentBoard = _this.gol2_board1isCurrent ? _this.gol2_lifeBoard1 : _this.gol2_lifeBoard2;
    // Draw random group of cells
    for (yPos = quarterBoardHeight; yPos <= (2 * quarterBoardHeight); yPos++) {
      for (xPos = quarterBoardWidth; xPos <= (2 * quarterBoardWidth); xPos++){
        currentBoard[yPos][xPos] = {state: getRandomCell()};
      }
    }
    _this.gol2_drawLife();
  };

  // Register the gol2 object to the global namespace
  root.Gol2 = Gol2;
}(this));
// ticker.js
// (TODO: ticker.js website here)
// (c) 2014 Max Hubenthal
// Ticker may be freely distributed under the MIT license.

// Wrap the library in an IIFE
(function(window){ 
  // Declare tkr object for use in global namespace
  var tkr = {
      
    // Current version.
    VERSION: "1.0"
  };

  /////////////////////////////////////////////
  //  tkr constants & tkr setup
  /////////////////////////////////////////////

  // References to <canvas> element
  // Note: for tkr to work, set the id of the <canvas>
  //   element to "tkr_canvas".
  var tkr_canvas = document.getElementById("tkr_canvas");
  var tkr_ctx = tkr_canvas.getContext('2d');

  // Default tkr grid values
  var tkr_gridWidth = tkr_canvas.width = 672, tkr_gridHeight = tkr_canvas.height = 122, tkr_gridUnitSize = 10, tkr_gridColor, tkr_gridLineWidth = 1;
    
  // Default tkr message values
  var tkr_message = [], tkr_messageShapeArray = [], tkr_messageColor, tkr_gridOffset = tkr_gridUnitSize + tkr_gridLineWidth, tkr_charOffset = 672, tkr_messageInterval = 60;
    
  // Default tkr run status values
  var tkr_IntervalId, tkr_isPaused = false, tkr_isForward = false;
    
  // JSON object of tkr char shapes for UTF-8 codes
  //  in decimal from 32 to 126.
  //  Here is a good list of the available chars:
  //    http://utf8-chartable.de/unicode-utf8-table.pl?utf8=dec
  // Position [0] of each "pattern" is the width of the shape.
  // Note: lowercase letters default to uppercase.
  var tkr_JSONcharShapes = {"charPatterns": [
      {"char": " ", "pattern": [3]},
      {"char": "!", "pattern": [2,6,12,18,30]},
      {"char": "\"", "pattern": [4,6,12,8,14]},
      {"char": "#", "pattern": [6,7,9,12,13,14,15,16,19,21,24,25,26,27,28,31,33]},
      {"char": "$", "pattern": [4,1,6,7,8,12,18,19,20,26,30,31,32,37]},
      {"char": "%", "pattern": [5,12,15,20,25,30,33]},
      {"char": "&", "pattern": [4,13,18,19,20,25]},
      {"char": "'", "pattern": [2,6,12]},
      {"char": "(", "pattern": [4,2,7,12,18,25,32]},
      {"char": ")", "pattern": [4,0,7,14,20,25,30]},
      {"char": "*", "pattern": [6,6,8,10,13,14,15,18,19,20,21,22,25,26,27,30,32,34]},
      {"char": "+", "pattern": [4,13,18,19,20,25]},
      {"char": ",", "pattern": [2,30,36]},
      {"char": "-", "pattern": [4,18,19,20]},
      {"char": ".", "pattern": [2,30]},
      {"char": "/", "pattern": [5,15,20,25,30]},
      {"char": "0", "pattern": [4,6,7,8,12,14,18,20,24,26,30,31,32]},
      {"char": "1", "pattern": [2,6,12,18,24,30]},
      {"char": "2", "pattern": [4,6,7,8,14,18,19,20,24,30,31,32]},
      {"char": "3", "pattern": [4,6,7,8,14,18,19,20,26,30,31,32]},
      {"char": "4", "pattern": [4,6,8,12,14,18,19,20,26,32]},
      {"char": "5", "pattern": [4,6,7,8,12,18,19,20,26,30,31,32]},
      {"char": "6", "pattern": [4,6,7,8,12,18,19,20,24,26,30,31,32]},
      {"char": "7", "pattern": [4,6,7,8,14,20,26,32]},
      {"char": "8", "pattern": [4,6,7,8,12,14,18,19,20,24,26,30,31,32]},
      {"char": "9", "pattern": [4,6,7,8,12,14,18,19,20,26,30,31,32]},
      {"char": ":", "pattern": [2,18,30]},
      {"char": ";", "pattern": [2,18,30,36]},
      {"char": "<", "pattern": [3,13,18,25]},
      {"char": "=", "pattern": [4,12,13,14,24,25,26]},
      {"char": ">", "pattern": [3,12,19,24]},
      {"char": "?", "pattern": [4,0,1,2,8,13,14,19,31]},
      {"char": "@", "pattern": [6,0,1,2,3,4,6,10,12,14,16,18,20,21,22,24,30,31,32,33,34]},
      {"char": "A", "pattern": [4,6,7,8,12,14,18,19,20,24,26,30,32]},
      {"char": "B", "pattern": [4,6,7,8,12,14,18,19,20,24,26,30,31,32]},
      {"char": "C", "pattern": [4,6,7,8,12,18,24,30,31,32]},
      {"char": "D", "pattern": [4,8,14,18,19,20,24,26,30,31,32]},
      {"char": "E", "pattern": [4,6,7,8,12,18,19,20,24,30,31,32]},
      {"char": "F", "pattern": [4,6,7,8,12,18,19,20,24,30]},
      {"char": "G", "pattern": [4,6,7,8,12,18,20,24,26,30,31,32]},
      {"char": "H", "pattern": [4,6,8,12,14,18,19,20,24,26,30,32]},
      {"char": "I", "pattern": [2,6,12,18,24,30]},
      {"char": "J", "pattern": [4,8,14,20,24,26,30,31,32]},
      {"char": "K", "pattern": [4,6,8,12,14,18,19,24,26,30,32]},
      {"char": "L", "pattern": [4,6,12,18,24,30,31,32]},
      {"char": "M", "pattern": [6,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,32,34]},
      {"char": "N", "pattern": [5,6,9,12,13,15,18,20,21,24,27,30,33]},
      {"char": "O", "pattern": [4,6,7,8,12,14,18,20,24,26,30,31,32]},
      {"char": "P", "pattern": [4,6,7,8,12,14,18,19,20,24,30]},
      {"char": "Q", "pattern": [4,6,7,8,12,14,18,19,20,26,32]},
      {"char": "R", "pattern": [4,6,7,8,12,14,18,19,24,26,30,32]},
      {"char": "S", "pattern": [4,6,7,8,12,18,19,20,26,30,31,32]},
      {"char": "T", "pattern": [4,6,7,8,13,19,25,31]},
      {"char": "U", "pattern": [4,6,8,12,14,18,20,24,26,30,31,32]},
      {"char": "V", "pattern": [4,6,8,12,14,18,20,25,31]},
      {"char": "W", "pattern": [6,6,8,10,12,14,16,18,20,22,24,26,28,30,31,32,33,34]},
      {"char": "X", "pattern": [6,6,10,13,15,20,25,27,30,34]},
      {"char": "Y", "pattern": [4,6,8,12,14,19,25,31]},
      {"char": "Z", "pattern": [4,6,7,8,14,19,24,30,31,32]},
      {"char": "[", "pattern": [3,6,7,12,18,24,30,31]},
      {"char": "\\", "pattern": [5,12,19,26,33]},
      {"char": "]", "pattern": [3,6,7,13,19,25,30,31]},
      {"char": "^", "pattern": [4,7,12,14]},
      {"char": "_", "pattern": [5,30,31,32,33]},
      {"char": "`", "pattern": [3,6,13]},
      {"char": "a", "pattern": [4,6,7,8,12,14,18,19,20,24,26,30,32]},
      {"char": "b", "pattern": [4,6,7,8,12,14,18,19,20,24,26,30,31,32]},
      {"char": "c", "pattern": [4,6,7,8,12,18,24,30,31,32]},
      {"char": "d", "pattern": [4,8,14,18,19,20,24,26,30,31,32]},
      {"char": "e", "pattern": [4,6,7,8,12,18,19,20,24,30,31,32]},
      {"char": "f", "pattern": [4,6,7,8,12,18,19,20,24,30]},
      {"char": "g", "pattern": [4,6,7,8,12,18,20,24,26,30,31,32]},
      {"char": "h", "pattern": [4,6,8,12,14,18,19,20,24,26,30,32]},
      {"char": "i", "pattern": [2,6,12,18,24,30]},
      {"char": "j", "pattern": [4,8,14,20,24,26,30,31,32]},
      {"char": "k", "pattern": [4,6,8,12,14,18,19,24,26,30,32]},
      {"char": "l", "pattern": [4,6,12,18,24,30,31,32]},
      {"char": "m", "pattern": [6,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,32,34]},
      {"char": "n", "pattern": [5,6,9,12,13,15,18,20,21,24,27,30,33]},
      {"char": "o", "pattern": [4,6,7,8,12,14,18,20,24,26,30,31,32]},
      {"char": "p", "pattern": [4,6,7,8,12,14,18,19,20,24,30]},
      {"char": "q", "pattern": [4,6,7,8,12,14,18,19,20,26,32]},
      {"char": "r", "pattern": [4,6,7,8,12,14,18,19,24,26,30,32]},
      {"char": "s", "pattern": [4,6,7,8,12,18,19,20,26,30,31,32]},
      {"char": "t", "pattern": [4,6,7,8,13,19,25,31]},
      {"char": "u", "pattern": [4,6,8,12,14,18,20,24,26,30,31,32]},
      {"char": "v", "pattern": [4,6,8,12,14,18,20,25,31]},
      {"char": "w", "pattern": [6,6,8,10,12,14,16,18,20,22,24,26,28,30,31,32,33,34]},
      {"char": "x", "pattern": [6,6,10,13,15,20,25,27,30,34]},
      {"char": "y", "pattern": [4,6,8,12,14,19,25,31]},
      {"char": "z", "pattern": [4,6,7,8,14,19,24,30,31,32]},
      {"char": "{", "pattern": [4,7,8,13,18,25,31,32]},
      {"char": "|", "pattern": [2,6,12,18,24,30]},
      {"char": "}", "pattern": [4,6,7,13,20,25,30,31]},
      {"char": "~", "pattern": [5,18,13,20,15]}
  ]};

  /////////////////////////////////////////////
  //  Internal tkr functions
  /////////////////////////////////////////////

  // Draw grid on canvas element
  function tkr_drawGrid(){
    // Clear canvas of remnants
    tkr_ctx.clearRect(0,0,tkr_gridWidth,tkr_gridHeight);
    tkr_ctx.lineWidth = tkr_gridLineWidth;
      
    // Draw vertical grid, start at 0.5 to allow for non-blurry 1px line
    for (var x = 0.5; x <= tkr_gridWidth; x++){
      tkr_ctx.fillStyle = tkr_gridColor;
      tkr_ctx.beginPath();
      tkr_ctx.moveTo(x, 0);
      tkr_ctx.lineTo(x, tkr_gridHeight);
      tkr_ctx.closePath();
      tkr_ctx.stroke();
      x += tkr_gridUnitSize;
    }
      
    // Draw horizontal grid, start at 0.5 to allow for non-blurry 1px line
    for (var y = 0.5; y <= tkr_gridHeight; y++){
      tkr_ctx.fillStyle = tkr_gridColor;
      tkr_ctx.beginPath();
      tkr_ctx.moveTo(0, y);
      tkr_ctx.lineTo(tkr_gridWidth, y);
      tkr_ctx.closePath();
      tkr_ctx.stroke();
      y += tkr_gridUnitSize;
    }
  }

  // Shape class constructor
  function tkr_shape(arrayOfSquaresToColor){
    // Create generic 6x6 grid, which is positioned on the canvas with a 2 box
    //   border to the top and bottom.
    //
    // tkr_shape takes an array of squares to color,
    //   which correspond to the following positions:
    //
    // 00--01--02--03--04--05
    // 06--07--08--09--10--11
    // 12--13--14--15--16--17
    // 18--19--20--21--22--23
    // 24--25--26--27--28--29
    // 30--31--32--33--34--35
    // 36--37--38--39--40--41
    //
    this.squaresToColor = arrayOfSquaresToColor;
    this.genericShape = [[],[]];
    // Declare array of rectangle coordinates
    this.shapeArray = [[],[]];
    // Grid line width
    this.gridLineWidth = tkr_gridLineWidth;
  }

  // Declare Shape class properties on prototype
  tkr_shape.prototype = {
    // Constructor
    constructor: tkr_shape,
    
    // Load a generic array of coordinates for use in drawing shapes
    loadGenericShape: function(){
      // Fill generic shape with zero-based coordinates
      var xVal = 0;
      var yVal = 2*tkr_gridOffset;
      var counter = 0;
      while(counter<48){
        for(var i=0;i<6;i++){
          this.genericShape[counter] = [xVal,yVal];
          xVal += tkr_gridOffset;
          counter++;
        }
        xVal = 0;
        yVal += tkr_gridOffset;
      }
    },
      
    // Load a shape with generic coordinates from an array of squares to "turn on"
    loadShape: function (){
      // Add positions to color to the shape
      for (var i = 1; i < this.squaresToColor.length; i++){
        this.shapeArray[i] = this.genericShape[this.squaresToColor[i]];
        // Set each x coordinate of shape to offset position in message string
        this.shapeArray[i][0] += tkr_charOffset;
        // Set each y coordinate of shape to account for grid line width
        this.shapeArray[i][1] += this.gridLineWidth;
      }
      // After loading the shape, increment the offset(pointer) to
      //   allow for writing the next char
      tkr_charOffset += (this.squaresToColor[0] * tkr_gridOffset);
    },

    // Draw a shape, given a '2d' <canvas> context
    animateShapeForward: function (){
      for (var i = 0; i < this.shapeArray.length; i++){
        // Pixel is ready to cycle back to enter right of ticker
        if (this.shapeArray[i][0] < 0) {
          // Reset position to ticker display width
          this.shapeArray[i][0] = tkr_charOffset;
        }
        var tempX = this.shapeArray[i][0];
        var tempY = this.shapeArray[i][1];
          
        // Draw shape
        tkr_ctx.fillStyle = tkr_messageColor;
        tkr_ctx.fillRect(tempX,tempY,tkr_gridUnitSize,tkr_gridUnitSize);
        this.shapeArray[i][0] -= tkr_gridOffset; // Decrement x coordinate position
      }
    }
  };

  // Load a message array of tkr_shape objects from an array of UTF-8 codes
  function tkr_loadMessageShapeArray(newCharArray){
    // Make sure tkr_messageShapeArray is empty
    tkr_messageShapeArray = [];
    // Reset the message offset
    tkr_charOffset = tkr_gridWidth;
    var newShape;
    // Convert chars to tkr_shape objects and add to message array
    for(var i=0;i<newCharArray.length;i++){
      // Invalid char is passed in, "!" is returned.
      if((newCharArray[i]>94)||(newCharArray[i]<0)){
        newShape = new tkr_shape(tkr_JSONcharShapes.charPatterns[1].pattern);
      }
      newShape = new tkr_shape(tkr_JSONcharShapes.charPatterns[newCharArray[i]-32].pattern);
      newShape.loadGenericShape();  // Load the generic tkr shape template
      // Load the shape, which creates an array of (x,y) coordinates
      newShape.loadShape();  
      tkr_messageShapeArray[i] = newShape;  // Add the shape to the message array
    }
  }
  
  // Draw letters from message to canvas, an array of tkr_shape objects are passed in
  function tkr_writeMessageForward(messageArray){
    for(var i=0; i<messageArray.length; i++){
        messageArray[i].animateShapeForward();
    }
  }

  // Internal tkr contol methods
  function tkr_playForward(){ 
    // If tkr is not already running, start it up, otherwise do nothing
    if(!tkr_isForward){
      clearInterval(tkr_IntervalId);  // Clear any previously running tkr
      tkr_isForward = true;
      tkr_IntervalId = setInterval(function(){
        tkr_drawGrid();
        tkr_writeMessageForward(tkr_messageShapeArray);
      }, tkr_messageInterval);
    }
  }
  
  function tkr_pause(){
    clearInterval(tkr_IntervalId);
    tkr_isPaused = true;
    tkr_isForward = false;
  }

  /////////////////////////////////////////////
  //  External functions to be called by user
  /////////////////////////////////////////////

  // Setters
  tkr.setMessage = function(newMessage){
    // Make sure the array is empty
    tkr_message = [];
    // Place array of UTF-8 codes into tkr_message
    for(var i=0;i<newMessage.length;i++){
      tkr_message[i] = newMessage.charCodeAt(i);
    }
    // Load shapes with array of UTF-8 codes
    tkr_loadMessageShapeArray(tkr_message);
  };
  tkr.setMessageColor = function(newMessageColor){
    tkr_messageColor = newMessageColor;
  };
  tkr.setMessageInterval = function(newMessageInterval){
    tkr_messageInterval = newMessageInterval;
  };
    
  // The below methods may break the library at this point if called.
  // Future versions will allow for a flexible sized grid.
  /*
  tkr.setGridColor = function(newGridColor){
    tkr_gridColor = newGridColor;
  };
  tkr.setGridHeight = function(newGridHeight){
    tkr_gridHeight = newGridHeight;
  };
  tkr.setGridWidth = function(newGridWidth){
    tkr_gridWidth = newGridWidth;
  };
  tkr.setGridUnitSize = function(newGridUnitSize){
    tkr_gridUnitSize = newGridUnitSize;
  };
  */
  
  // tkr controls
  tkr.playForward = function(){
    tkr_playForward();
  };
  tkr.pause = function(){
    tkr_pause();
  };

  // Sample code to test all the available tkr chars
  //tkr.setMessage(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`{|}~");

  // Register the tkr object to the global browser namespace
  window.tkr = tkr;
}(window));

(function(window){
  // Main script file
  
  // Set up the tkr object
    tkr.setMessage("++ ticker.js = a simple javascript ticker ++ full site coming soon ++");
    tkr.setMessageColor("red");
    tkr.playForward();
		// Allow tkr to be updated
    window.updateTkrValues = function (){
      var newTkrMessageText = document.getElementById("messageText").value;
      var newTkrMessageColor = document.getElementById("messageColor").value;
      var newTkrInterval = document.getElementById("messageInterval").value;
      tkr.setMessage(newTkrMessageText);
      tkr.setMessageColor(newTkrMessageColor);
      // Change tkr speed only if different than default 60ms
      if(newTkrInterval != 60){
        tkr.setMessageInterval(newTkrInterval);
        tkr.pause();
        tkr.playForward();
      }
    };
    // Set up the gol object
    gol.setupLife();
    gol.setGridColor("grey");
    gol.setCellColor("yellow");
    // Populate the board with a random game of life
    gol.setSampleBoard();
		// Allow gol to be updated
    window.updateGolValues = function (){
      var newGolGridColor = document.getElementById("golGridColor").value;
      var newGolCellColor = document.getElementById("golCellColor").value;
      var newGolInterval = document.getElementById("golInterval").value;
      gol.setGridColor(newGolGridColor);
      gol.setCellColor(newGolCellColor);
      gol.setLifeSpeed(newGolInterval);
    };
    // Set up the gol2 object, attach to window for access from index.html buttons
    window.gol2 = new Gol2('gol2_canvas',{boardWidth: 40, boardHeight: 40});
    gol2.setupLife();
    // Populate the board with a random game of life
    gol2.setSampleBoard();
    // Allow gol to be updated
    window.updateGol2Values = function (){
      var newGol2Interval = document.getElementById("gol2Interval").value;
      gol2.setLifeSpeed(newGol2Interval);
    };
}(window));
