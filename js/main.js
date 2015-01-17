(function(){
  // Main script file
  
  // Set up the tkr object
    tkr.setMessage("++ ticker.js = a simple javascript ticker ++ full site coming soon ++");
    tkr.setMessageColor("red");
    tkr.playForward();
    function updateTkrValues(){
      var newTkrMessageText = document.getElementById("messageText").value;
      var newTkrMessageColor = document.getElementById("messageColor").value;
      var newTkrInterval = document.getElementById("messageInterval").value
      tkr.setMessage(newTkrMessageText);
      tkr.setMessageColor(newTkrMessageColor);
      // Change tkr speed only if different than default 60ms
      if(newInterval != 60){
        tkr.setMessageInterval(newTkrInterval);
        tkr.pause();
        tkr.playForward();
      }
    }
    // Set up the gol object
    gol.setupLife();
    gol.setGridColor("grey");
    gol.setCellColor("yellow");
    // Populate the board with a random game of life
    gol.setSampleBoard();
    function updateGolValues(){
      var newGolGridColor = document.getElementById("golGridColor").value;
      var newGolCellColor = document.getElementById("golCellColor").value;
      var newGolInterval = document.getElementById("golInterval").value;
      gol.setGridColor(newGolGridColor);
      gol.setCellColor(newGolCellColor);
      gol.setLifeSpeed(newGolInterval);
    }
}());