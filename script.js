const digitContainers = document.querySelectorAll(".digit-container");
const rollSound = document.getElementById("rollSound");
const tadaSound = document.getElementById("tadaSound");
const resetSound = document.getElementById("resetSound");
const backgroundAudio = document.getElementById("backgroundAudio"); // Background audio element
const clappingSound = document.getElementById('clappingSound');  // Clapping sound element

const speakerIcon = document.getElementById("speakerIcon");
const speakerText = document.getElementById("speakerText");
const historyList = document.getElementById("historyList");

let rollingIntervals = [];
let isRolling = false;
let isStopping = false;
let isAudioPlaying = false; // Track whether the audio has started


// Mute/Unmute functionality for the speaker icon
speakerIcon.addEventListener("click", () => {
  if (isAudioPlaying) {
    // If audio is already playing, pause and reset
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0; // Restart audio from beginning
    speakerText.textContent = "🔇"; // Switch to mute icon
  } else {
    // If audio is not playing, play it
    backgroundAudio.play();
    speakerText.textContent = "🔊"; // Switch to speaker icon
  }
  isAudioPlaying = !isAudioPlaying; // Toggle audio play state
});


// Ensure seamless looping by restarting the rolling sound manually
rollSound.addEventListener("ended", () => {
  rollSound.currentTime = 0; // Restart audio
  rollSound.play(); // Play again
});

// Function to generate a random number between 0 and 500001
const getRandomNumberInRange = (max) => {
  const randomNumber = Math.floor(Math.random() * (max + 1)); // Inclusive of max
  return String(randomNumber).padStart(6, "0"); // Add leading zeros for 6-digit format
};

// Populate digits (0–9) for rolling
digitContainers.forEach((container) => {
  const digit = container.querySelector(".digit");
  for (let i = 0; i < 20; i++) {
    const numDiv = document.createElement("div");
    numDiv.textContent = i % 10; // Repeating digits (0–9)
    digit.appendChild(numDiv);
  }
});

// Function to disable the "Start" and "Reset" buttons when the start button is clicked
function disableStartAndReset() {
  document.getElementById("startButton").disabled = true;
  document.getElementById("resetButton").disabled = true;
  document.getElementById("stopButton").disabled = false;
}

// Function to disable the "Start" and "Stop" buttons when the stop button is clicked
function disableStartAndStop() {
  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").disabled = true;
  document.getElementById("resetButton").disabled = false; // Enable reset only after stop
}

// Function to disable the "Reset" and "Stop" buttons when the reset button is clicked
function disableResetAndStop() {
  document.getElementById("resetButton").disabled = true;
  document.getElementById("stopButton").disabled = true;
  document.getElementById("startButton").disabled = false;
}

// Reference to the "Export to Excel" button (you need to add this in HTML)
const exportButton = document.createElement("button");
exportButton.textContent = "Export to Excel";
exportButton.style.padding = "10px 20px";
exportButton.style.marginTop = "20px";
exportButton.style.backgroundColor = "#4CAF50";
exportButton.style.color = "white";
exportButton.style.border = "none";
exportButton.style.cursor = "pointer";
exportButton.style.borderRadius = "5px";
document.body.appendChild(exportButton); // Append to the body

// Add the data to history and update the Excel
function addToHistory(number) {
  historyData.push({ Timestamp: new Date().toLocaleString(), Number: number });

  // Display in the History UI
  const listItem = document.createElement("li");
  listItem.textContent = number;
  historyList.prepend(listItem); // Add to the top of the list
}

// Export data to an Excel file
function exportToExcel() {
  if (historyData.length === 0) {
    alert("No data to export!");
    return;
  }

  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(historyData);

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "History");

  // Export the workbook
  XLSX.writeFile(workbook, "odometer_history.xlsx");
}

// Attach click event to the button
exportButton.addEventListener("click", exportToExcel);

// Start rolling numbers
function startRolling() {
  if (isRolling) return; // Prevent multiple starts
  isRolling = true;
  isStopping = false;

  // Disable "Start" and "Reset" buttons when start is clicked
  disableStartAndReset();

  // Play the rolling sound
  rollSound.currentTime = 0; // Ensure it starts from the beginning
  rollSound.play();

  digitContainers.forEach((container, index) => {
    const digit = container.querySelector(".digit");
    let position = 0;

    rollingIntervals[index] = setInterval(() => {
      position += 60; // Fast rolling
      digit.style.transform = `translateY(-${position % 600}px)`; // Move vertically
      digit.style.transition = "none"; // Instant transition for fast rolling
    }, 10); // Fast speed for rolling
  });
}
let historyData = []; // Array to store history data
let gameCount = 0; // Track the number of games played
const maxGames = 5; // Maximum games allowed before redirection

// Function to add final target number and timestamp to history data
function addToHistory(finalNumber) {
    const timestamp = new Date().toLocaleString(); // Get current timestamp
    historyData.push({ Timestamp: timestamp, TargetReading: finalNumber });

    // Debug log to verify data is being added to history
    console.log("Added to history:", finalNumber, historyData);

    // Display the target reading in the history section on the page
    const historyList = document.getElementById("historyList");
    const listItem = document.createElement("li");
    listItem.textContent = `${timestamp} - ${finalNumber}`;
    historyList.prepend(listItem); // Add to the top of the list
}

// Function to export history data to Excel
function exportToExcel() {
    if (historyData.length === 0) {
        alert("No data to export!");
        return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");

    XLSX.writeFile(workbook, "odometer_history.xlsx");
}

// Stop rolling numbers gradually
function stopRolling() {
    if (!isRolling || isStopping) return; // Prevent if not rolling or already stopping
    isStopping = true;
    isRolling = false;
  
    // Stop the rolling sound
    rollSound.pause();
    rollSound.currentTime = 0; // Reset to the beginning for next play
  
    // Play the tada sound
    tadaSound.currentTime = 0; // Ensure it starts from the beginning
    tadaSound.play();
  
    const finalNumber = getRandomNumberInRange(500001); // Get final 6-digit stopping number
    console.log(`Target Odometer Reading: ${finalNumber}`); // Log the target odometer reading
  
    let finalReading = ""; // To store the final odometer reading
  
    digitContainers.forEach((container, index) => {
      const digit = container.querySelector(".digit");
      const targetDigit = parseInt(finalNumber[index]); // Get the digit at this position
      clearInterval(rollingIntervals[index]); // Stop fast rolling
  
      // Gradual deceleration
      let position = parseInt(digit.style.transform.replace("translateY(-", "").replace("px)", "")) || 0;
      const finalStop = targetDigit * 100; // Adjust final position based on digit value (ensure correct stopping position)
      let speed = 20; // Initial speed for deceleration
  
      const slowDown = setInterval(() => {
        position += (finalStop - position) / 8; // Gradual reduction in movement
        digit.style.transform = `translateY(-${Math.round(position)}px)`; // Apply vertical movement
        digit.style.transition = `transform ${speed / 100}s ease-out`; // Smooth easing
  
        if (Math.abs(position - finalStop) < 1) {
          digit.style.transform = `translateY(-${finalStop}px)`; // Ensure exact stop at target
          clearInterval(slowDown); // Stop at the final position
  
          // Collect the digit for final odometer reading
          finalReading += targetDigit;
  
          // Once all digits have stopped, log the odometer reading
          if (finalReading.length === 6) {
            console.log(`Final Odometer Reading: ${finalReading}`);
  
            // Add the final target number to the history list
            addToHistory(finalNumber); // Add target number to history
            disableStartAndStop(); // Disable buttons after stop
            gameCount++; // Increment game count
  
            // If 5 games have been played, show confetti animation
            if (gameCount >= maxGames) {
                showConfetti(); // Show confetti
                disableButtons(); // Disable buttons
            }
          }
        }
  
        // Increment speed for slower updates
        speed += 2;
      }, speed + index * 0.1); // Slightly stagger each digit's slowdown
    });
  }

  function showConfetti() {
    // Launch confetti for 10 seconds
    launchContinuousConfetti(10000);
  
    // Play clapping sound
    clappingSound.currentTime = 0;
    clappingSound.play();
  
    // Disable buttons for 5 seconds
    setTimeout(() => {
      disableButtons();
    }, 5000);
  }
  
  
  // Function to disable the buttons
  function disableButtons() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
      button.disabled = true; // Disable each button
    });
  }

// Function to reset the meter to 000000
function resetMeter() {
  // Stop the rolling sound and reset it
  rollSound.pause();
  rollSound.currentTime = 0; // Reset the sound to the start

  // Play the reset sound
  resetSound.currentTime = 0; // Ensure it starts from the beginning
  resetSound.play();

  // Reset the target digits
  digitContainers.forEach((container) => {
    const digit = container.querySelector(".digit");
    // Reset each digit container to 0 (first number)
    digit.style.transform = "translateY(0px)"; // Position the number at the top
  });

  // Reset the odometer reading to 000000
  console.log("Odometer Reset to: 000000");

  // Disable "Reset" and "Stop" buttons when reset is clicked
  disableResetAndStop();
}
function launchContinuousConfetti(duration = 10000) {
    const confettiContainer = document.createElement("div");
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = 0;
    confettiContainer.style.left = 0;
    confettiContainer.style.width = "100%";
    confettiContainer.style.height = "100%";
    confettiContainer.style.pointerEvents = "none";
    document.body.appendChild(confettiContainer);
  
    const interval = 200; // Add new confetti every 200ms
    const endTime = Date.now() + duration; // Calculate end time
  
    const createConfetti = () => {
      for (let i = 0; i < 10; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.position = "absolute";
        confetti.style.width = `${Math.random() * 8 + 4}px`;
        confetti.style.height = `${Math.random() * 8 + 4}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-10vh`;
        confetti.style.opacity = Math.random() + 0.5;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear`;
  
        confettiContainer.appendChild(confetti);
  
        // Remove confetti after its animation ends
        confetti.addEventListener("animationend", () => {
          confettiContainer.removeChild(confetti);
        });
      }
    };
  
    // Run the confetti creation periodically until the duration ends
    const intervalId = setInterval(() => {
      if (Date.now() >= endTime) {
        clearInterval(intervalId);
        document.body.removeChild(confettiContainer);
      } else {
        createConfetti();
      }
    }, interval);
  }
  
  // Add this style to your CSS for confetti animation
  const confettiStyles = `
  @keyframes fall {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
    }
  }
  
  .confetti {
    position: absolute;
    border-radius: 50%;
    animation: fall 3s linear infinite;
  }
  `;
  
  // Inject styles into the page
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = confettiStyles;
  document.head.appendChild(styleSheet);
  

// Event listeners
document.getElementById("startButton").addEventListener("click", startRolling);
document.getElementById("stopButton").addEventListener("click", stopRolling);
document.getElementById("resetButton").addEventListener("click", resetMeter);
