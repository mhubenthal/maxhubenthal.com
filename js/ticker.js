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
  var tkr_IntervalId, tkr_isPaused = false, tkr_isForward = false, tkr_isReversed = false;
    
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
    // Overall width of ticker
    this.reset = tkr_gridWidth;
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
    },
    animateShapeBackwards: function (){
      for (var i = 0; i < this.shapeArray.length; i++){
        // Pixel is ready to cycle back to enter right of ticker
        if (this.shapeArray[i][0] > tkr_gridWidth) {
          // Reset position to ticker display width
          this.shapeArray[i][0] = -tkr_charOffset;
        }
        var tempX = this.shapeArray[i][0];
        var tempY = this.shapeArray[i][1];
          
        // Draw shape
        tkr_ctx.fillStyle = tkr_messageColor;
        tkr_ctx.fillRect(tempX,tempY,tkr_gridUnitSize,tkr_gridUnitSize);
        this.shapeArray[i][0] += tkr_gridOffset; // Decrement x coordinate position
      }
    }
  };

  // Load a message array of tkr_shape objects from an array of UTF-8 codes
  function tkr_loadMessageShapeArray(newCharArray){
    // Make sure tkr_messageShapeArray is empty
    tkr_messageShapeArray = [];
    // Reset the message offset
    tkr_charOffset = 672;
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
  function tkr_writeMessageBackwards(messageArray){
    for(var i=0; i<messageArray.length; i++){
        messageArray[i].animateShapeBackwards();
    }
  }

  // Internal tkr contol methods
  function tkr_playForward(){ 
    // If tkr is not already running, start it up, otherwise do nothing
    if(!tkr_isForward){
      clearInterval(tkr_IntervalId);  // Clear any previously running tkr
      tkr_isForward = true;
      tkr_isReversed = false;
      tkr_IntervalId = setInterval(function(){
        tkr_drawGrid();
        tkr_writeMessageForward(tkr_messageShapeArray);
      }, tkr_messageInterval);
    }
  }
  function tkr_playReverse(){
    // If tkr is not already running, start it up, otherwise do nothing
    if(!tkr_isReversed){
      clearInterval(tkr_IntervalId);  // Clear any previously running tkr
      tkr_isReversed = true;
      tkr_isForward = false;
      tkr_IntervalId = setInterval(function(){
        tkr_drawGrid();
        tkr_writeMessageBackwards(tkr_messageShapeArray);
      }, tkr_messageInterval);
    }
  }
  
  function tkr_pause(){
    clearInterval(tkr_IntervalId);
    tkr_isPaused = true;
    tkr_isForward = false;
    tkr_isReversed = false;
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
  // tkr.playReverse function is buggy, use/improve at your own peril!
  /*
  tkr.playReverse = function(){
    tkr_playReverse();
  };
  */

  // Sample code to test all the available tkr chars
  //tkr.setMessage(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`{|}~");

  // Register the tkr object to the global namespace
  window.tkr = tkr;
}(window));
