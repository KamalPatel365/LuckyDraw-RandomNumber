let drawingInterval;

function startDrawing() {
  // Disable the Start button and enable the Stop button
  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").disabled = false;
  
  // Start generating random numbers every 50 milliseconds
  drawingInterval = setInterval(function() {
    const randomNumber = Math.floor(Math.random() * 500001); // Random number from 0 to 500000
    const formattedNumber = String(randomNumber).padStart(6, '0'); // Ensure it's always 6 digits
    document.getElementById("drawnNumber").innerText = formattedNumber;
  }, 50);
}

function stopDrawing() {
  // Stop generating random numbers
  clearInterval(drawingInterval);
  
  // Enable the Start button and disable the Stop button
  document.getElementById("startButton").disabled = false;
  document.getElementById("stopButton").disabled = true;
  
  // Finalize the displayed number (just to stop at one value)
  const finalNumber = document.getElementById("drawnNumber").innerText;
  console.log(`Final drawn number: ${finalNumber}`);
}
