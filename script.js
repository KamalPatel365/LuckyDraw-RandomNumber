const digitContainers = document.querySelectorAll(".digit-container");
const rollSound = document.getElementById("rollSound");
const tadaSound = document.getElementById("tadaSound");
const backgroundAudio = document.getElementById("backgroundAudio"); // Background audio element
const speakerIcon = document.getElementById("speakerIcon");
const speakerText = document.getElementById("speakerText");

let rollingIntervals = [];
let isRolling = false;
let isStopping = false;
let isAudioStarted = false; // Track whether the audio has started

// Start background audio when the speaker icon is clicked
speakerIcon.addEventListener("click", () => {
  if (!isAudioStarted) {
    backgroundAudio.play();
    speakerText.textContent = "🔇"; // Change icon to mute
    speakerIcon.style.cursor = "default"; // Disable further interaction with the icon
    isAudioStarted = true;

    // Enable the Start button once audio starts
    document.getElementById("startButton").disabled = false;
  }
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
          disableStartAndStop(); // Disable buttons after stop
        }
      }

      // Increment speed for slower updates
      speed += 2;
    }, speed + index * 0.1); // Slightly stagger each digit's slowdown
  });
}

// Function to reset the meter to 000000
function resetMeter() {
  // Stop the rolling sound and reset it
  rollSound.pause();
  rollSound.currentTime = 0; // Reset the sound to the start

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

// Event listeners
document.getElementById("startButton").addEventListener("click", startRolling);
document.getElementById("stopButton").addEventListener("click", stopRolling);
document.getElementById("resetButton").addEventListener("click", resetMeter);
