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
    // Set up the gol2 object
    gol2.setupLife();
    // Populate the board with a random game of life
    gol2.setSampleBoard();
    // Allow gol to be updated
    window.updateGol2Values = function (){
      var newGol2Interval = document.getElementById("gol2Interval").value;
      gol2.setLifeSpeed(newGol2Interval);
    };
}(window));
