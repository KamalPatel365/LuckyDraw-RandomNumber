const digitContainers = document.querySelectorAll(".digit-container");
let rollingIntervals = [];
let isRolling = false;
let isStopping = false;

// Function to generate a random number between 0 and 500001
const getRandomNumberInRange = (max) => {
  const randomNumber = Math.floor(Math.random() * (max + 1)); // Inclusive of max
  return String(randomNumber).padStart(6, "0"); // Add leading zeros for 6-digit format
};

// Populate digits (0–9) for rolling
digitContainers.forEach((container) => {
  const digit = container.querySelector(".digit");
  for (let i = 0; i < 10; i++) {
    const numDiv = document.createElement("div");
    numDiv.textContent = i; // Add digits from 0 to 9
    digit.appendChild(numDiv);
  }
});

// Start rolling numbers
function startRolling() {
  if (isRolling) return; // Prevent multiple starts
  isRolling = true;
  isStopping = false;

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

  const finalNumber = getRandomNumberInRange(500001); // Get final 6-digit stopping number
  console.log(`Target Odometer Reading: ${finalNumber}`); // Log the target odometer reading

  let finalReading = ""; // To store the final odometer reading

  digitContainers.forEach((container, index) => {
    const digit = container.querySelector(".digit");
    const targetDigit = parseInt(finalNumber[index]); // Get the digit at this position
    clearInterval(rollingIntervals[index]); // Stop fast rolling

    // Gradual deceleration
    let position = parseInt(digit.style.transform.replace("translateY(-", "").replace("px)", "")) || 0;
    const finalStop = targetDigit * 60; // Final position for the digit
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
        }
      }

      // Increment speed for slower updates
      speed += 2; 
    }, speed + index * 0.1); // Slightly stagger each digit's slowdown
  });
}

// Event listeners
document.getElementById("startButton").addEventListener("click", startRolling);
document.getElementById("stopButton").addEventListener("click", stopRolling);
