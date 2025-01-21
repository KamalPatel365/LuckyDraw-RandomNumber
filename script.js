// DOM Elements
const digitContainers = document.querySelectorAll(".digit-container");
const rollSound = document.getElementById("rollSound");
const tadaSound = document.getElementById("tadaSound");
const resetSound = document.getElementById("resetSound");
const backgroundAudio = document.getElementById("backgroundAudio"); // Background audio
const clappingSound = document.getElementById("clappingSound");  // Clapping sound
const speakerIcon = document.getElementById("speakerIcon");
const speakerText = document.getElementById("speakerText");
const historyList = document.getElementById("historyList");
const exportToExcelButton = document.getElementById("exportToExcelButton");

// Global Variables
let rollingIntervals = [];
let isRolling = false;
let isStopping = false;
let isAudioPlaying = false; // Track whether the audio has started
let historyData = []; // Store history data
let gameCount = 0; // Track the number of games played
const maxGames = 21; // Max games before redirection

// Event Listeners
speakerText.addEventListener("click", toggleAudio);
exportToExcelButton.addEventListener("click", exportToExcel);
document.getElementById("startButton").addEventListener("click", startRolling);
document.getElementById("stopButton").addEventListener("click", stopRolling);
document.getElementById("resetButton").addEventListener("click", resetMeter);

// Functions

// Toggle Audio Play/Pause
function toggleAudio() {
  if (isAudioPlaying) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0; // Restart audio
    speakerText.textContent = "🔇"; // Mute icon
  } else {
    backgroundAudio.play();
    speakerText.textContent = "🔊"; // Speaker icon
  }
  isAudioPlaying = !isAudioPlaying;
}

// Roll Sound: Looping on End
rollSound.addEventListener("ended", () => {
  rollSound.currentTime = 0; // Restart audio
  rollSound.play(); // Loop
});

// Generate Random Number
const getRandomNumberInRange = (max) => {
  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * (max + 1)); // Inclusive of max
    // 1st place to change required for increase/decrease of digit
    randomNumber = String(randomNumber).padStart(5, "0"); // 6-digit format
  } while (
    (randomNumber >= 4000 && randomNumber <= 5000) || // Exclude range 4000-5000
    (randomNumber >= 15000 && randomNumber <= 19999) || // Exclude range 15000-19999
    (randomNumber >= 25000 && randomNumber <= 29999) || // Exclude range 25000-29999
    historyData.includes(randomNumber) // Ensure number is not already in history
  ); // Regenerate if already exists
  return randomNumber;
};

// Populate Digits (0-9) for Rolling Animation
digitContainers.forEach((container) => {
  const digit = container.querySelector(".digit");
  for (let i = 0; i < 20; i++) {
    const numDiv = document.createElement("div");
    numDiv.textContent = i % 10; // Repeating digits (0-9)
    digit.appendChild(numDiv);
  }
});

// Button Disable Helpers
function disableStartAndReset() {
  document.getElementById("startButton").disabled = true;
  document.getElementById("resetButton").disabled = true;
  document.getElementById("stopButton").disabled = false;
}

function disableStartAndStop() {
  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").disabled = true;
  document.getElementById("resetButton").disabled = false;
}

function disableResetAndStop() {
  document.getElementById("resetButton").disabled = true;
  document.getElementById("stopButton").disabled = true;
  document.getElementById("startButton").disabled = false;
}

// Start Rolling Numbers
function startRolling() {
  if (isRolling || gameCount >= maxGames) return; // Prevent multiple starts or if max games reached
  isRolling = true;
  isStopping = false;
  disableStartAndReset();

  rollSound.currentTime = 0;
  rollSound.play();

  digitContainers.forEach((container, index) => {
    const digit = container.querySelector(".digit");
    let position = 0;

    rollingIntervals[index] = setInterval(() => {
      position += 60; // Fast rolling speed
      digit.style.transform = `translateY(-${position % 600}px)`;
      digit.style.transition = "none"; // Instant transition
    }, 10); // Fast speed for rolling
  });
}

// Add Final Target Number to History
function addToHistory(finalNumber) {
  const timestamp = new Date().toLocaleString();

  if (gameCount < 21) {
    historyData.push({ Participant: `Participant ${gameCount}`, CouponNumber: finalNumber });
    const participantId = `reading${gameCount + 1}`;
    document.getElementById(participantId).textContent = finalNumber;
  }
}

// Export History to Excel
function exportToExcel() {
  if (historyData.length === 0) {
    alert("No data to export!");
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(historyData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "History");

  XLSX.writeFile(workbook, "coupon_rolled_out.xlsx");
}

// Stop Rolling Numbers Gradually
function stopRolling() {
  if (!isRolling || isStopping || gameCount >= maxGames) return;
  isStopping = true;
  isRolling = false;

  rollSound.pause();
  rollSound.currentTime = 0; // Reset for next play

  tadaSound.currentTime = 0;
  tadaSound.play();

  // 2nd place to change required for increase/decrease of digit
  const finalNumber = getRandomNumberInRange(50001); // 6-digit number
  let finalReading = "";

  digitContainers.forEach((container, index) => {
    const digit = container.querySelector(".digit");
    const targetDigit = parseInt(finalNumber[index]);
    clearInterval(rollingIntervals[index]);

    let position = parseInt(digit.style.transform.replace("translateY(-", "").replace("px)", "")) || 0;
    const finalStop = targetDigit * 100;
    let speed = 20;

    const slowDown = setInterval(() => {
      position += (finalStop - position) / 8;
      digit.style.transform = `translateY(-${Math.round(position)}px)`;
      digit.style.transition = `transform ${speed / 100}s ease-out`;

      if (Math.abs(position - finalStop) < 1) {
        digit.style.transform = `translateY(-${finalStop}px)`;
        clearInterval(slowDown);
        finalReading += targetDigit;

        // 3rd place to change required for increase/decrease of digit
        if (finalReading.length === 5) {
          addToHistory(finalNumber);
          disableStartAndStop();
          gameCount++;

          if (gameCount >= maxGames) {
            showConfetti();
            disableButtons();
          }
        }
      }

      speed += 2;
    }, speed + index * 0.1);
  });
}

// Disable Buttons After Max Games
function disableButtons() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => {
    if (button.id !== "exportToExcelButton") {
      button.disabled = true;
    }
  });
}

// Show Confetti on Max Games Reached
function showConfetti() {
  launchContinuousConfetti(100000);
  clappingSound.currentTime = 0;
  clappingSound.play();

  setTimeout(() => {
    disableButtons();
  }, 5000);
}

// Launch Continuous Confetti
function launchContinuousConfetti(duration = 100000) {
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.top = 0;
  confettiContainer.style.left = 0;
  confettiContainer.style.width = "100%";
  confettiContainer.style.height = "100%";
  confettiContainer.style.pointerEvents = "none";
  document.body.appendChild(confettiContainer);

  const interval = 200;
  const endTime = Date.now() + duration;

  const createConfetti = () => {
    for (let i = 0; i < 20; i++) {
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

      confetti.addEventListener("animationend", () => {
        confettiContainer.removeChild(confetti);
      });
    }
  };

  const intervalId = setInterval(() => {
    if (Date.now() >= endTime) {
      clearInterval(intervalId);
      document.body.removeChild(confettiContainer);
    } else {
      createConfetti();
    }
  }, interval);
}

// CSS for Confetti Animation
const confettiStyles = `
  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(100vh) rotate(360deg); }
  }
  .confetti {
    position: absolute;
    border-radius: 50%;
    animation: fall 3s linear infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = confettiStyles;
document.head.appendChild(styleSheet);

// Reset Meter to 000000
function resetMeter() {
  rollSound.pause();
  rollSound.currentTime = 0;
  resetSound.currentTime = 0;
  resetSound.play();

  digitContainers.forEach((container) => {
    const digit = container.querySelector(".digit");
    digit.style.transform = "translateY(0px)";
  });

  console.log("Odometer Reset to: 000000");
  disableResetAndStop();
}
