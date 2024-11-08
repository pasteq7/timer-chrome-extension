class Timer {
    constructor() {
      this.minutes = 0;
      this.seconds = 0;
      this.isRunning = false;
      this.initDOM();
      this.attachEventListeners();
      this.loadState();
      this.MAX_TIME = 1440; // 24 hours in minutes
    }
  
    initDOM() {
      this.minutesElement = document.getElementById("minutes");
      this.secondsElement = document.getElementById("seconds");
      this.startButton = document.getElementById("start");
      this.stopButton = document.getElementById("stop");
      this.customTimeInput = document.getElementById("custom-time");
      this.timeButtonsContainer = document.querySelector(".time-buttons");
    }
  
    attachEventListeners() {
      this.startButton.addEventListener("click", () => this.start());
      this.stopButton.addEventListener("click", () => this.stop());
      this.customTimeInput.addEventListener("input", () => this.updateStartButtonState());
      this.timeButtonsContainer.addEventListener("click", event => {
        if (event.target.tagName === "BUTTON") {
          this.start(parseInt(event.target.dataset.time));
        }
      });
    }
  
    loadState() {
      chrome.storage.local.get(['minutes', 'seconds', 'isRunning'], (result) => {
        this.minutes = result.minutes || 0;
        this.seconds = result.seconds || 0;
        this.isRunning = result.isRunning || false;
        this.updateUI();
      });
    }
  
    start(time = parseInt(this.customTimeInput.value)) {
      if (this.isRunning) return;
      if (isNaN(time) || time <= 0) time = 1;
      if (time > this.MAX_TIME) time = this.MAX_TIME;
      this.minutes = Math.floor(time);
      this.seconds = 0;
      this.isRunning = true;
      this.updateUI();
      chrome.runtime.sendMessage({ action: 'startTimer', duration: time });
    }
  
    stop() {
      this.isRunning = false;
      this.minutes = 0;
      this.seconds = 0;
      this.updateUI();
      chrome.runtime.sendMessage({ action: 'stopTimer' });
    }
  
    updateUI() {
      this.minutesElement.textContent = this.minutes.toString().padStart(2, "0");
      this.secondsElement.textContent = this.seconds.toString().padStart(2, "0");
      this.startButton.disabled = this.isRunning || this.customTimeInput.value === "";
      this.stopButton.disabled = !this.isRunning;
      this.stopButton.classList.toggle("disabled", !this.isRunning);
      this.customTimeInput.disabled = this.isRunning;
      this.timeButtonsContainer.querySelectorAll("button").forEach(button => {
        button.disabled = this.isRunning;
        button.classList.toggle("disabled", this.isRunning);
      });
    }
  
    updateStartButtonState() {
      this.startButton.disabled = this.customTimeInput.value === "";
    }
}

const timer = new Timer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTimer') {
    timer.minutes = request.minutes;
    timer.seconds = request.seconds;
    timer.updateUI();
  } else if (request.action === 'timerFinished') {
    timer.stop();
  }
});
chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
  if (chrome.runtime.lastError) {
    console.log('Error getting timer state:', chrome.runtime.lastError);
    return;
  }
  if (response) {
    timer.minutes = response.minutes;
    timer.seconds = response.seconds;
    timer.isRunning = response.isRunning;
    timer.updateUI();
  }
});