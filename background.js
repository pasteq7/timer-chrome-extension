let timer = null;
let remainingSeconds = 0;
let warningNotificationsEnabled = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    startTimer(request.duration);
  } else if (request.action === 'stopTimer') {
    stopTimer();
  } else if (request.action === 'getTimerState') {
    sendResponse({
      minutes: Math.floor(remainingSeconds / 60),
      seconds: remainingSeconds % 60,
      isRunning: timer !== null
    });
  }
  return true; 
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'toggleWarning',
    title: 'Disable 1-minute warning',
    contexts: ['action']
  });

  // Load saved notification preference
  chrome.storage.local.get(['warningNotificationsEnabled'], (result) => {
    warningNotificationsEnabled = result.warningNotificationsEnabled ?? true;
    updateContextMenuTitle();
  });
});

function updateContextMenuTitle() {
  chrome.contextMenus.update('toggleWarning', {
    title: `${warningNotificationsEnabled ? 'Disable' : 'Enable'} 1-minute warning`
  });
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'toggleWarning') {
    warningNotificationsEnabled = !warningNotificationsEnabled;
    updateContextMenuTitle();
    chrome.storage.local.set({ warningNotificationsEnabled });
  }
});

function startTimer(duration) {
  stopTimer();
  remainingSeconds = duration * 60;
  updateTimer();
  timer = setInterval(updateTimer, 1000);
  saveState();
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    remainingSeconds = 0;
    chrome.action.setBadgeText({ text: '' });
    saveState();
  }
}

function updateTimer() {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    updateBadge(minutes);
    updatePopup(minutes, seconds);
    saveState();
    
    if (remainingSeconds === 60) {
      showWarningNotification();
    }
  } else {
    console.log('Timer reached zero, stopping and showing notification');
    stopTimer();
    showNotification();
  }
}

function updateBadge(minutes) {
  chrome.action.setBadgeText({ text: minutes.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#353F4F' });
}

function updatePopup(minutes, seconds) {
  chrome.runtime.sendMessage({
    action: 'updateTimer',
    minutes: minutes,
    seconds: seconds
  }, (response) => {
    if (chrome.runtime.lastError) {
      // Popup is not open, ignore the error
      console.log('Popup is not open, skipping update');
    }
  });
}

function showNotification() {
  const options = {
    type: 'basic',
    iconUrl: 'icon128.png',
    title: 'Timer Finished',
    message: 'Your timer has completed!',
    priority: 2,
    requireInteraction: true
  };

  chrome.notifications.create(options, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating notification:', chrome.runtime.lastError);
    } else {
      console.log('Notification created with ID:', notificationId);
    }
  });
}

function showWarningNotification() {
  if (!warningNotificationsEnabled) return;
  
  const options = {
    type: 'basic',
    iconUrl: 'icon128.png',
    title: 'One Minute Remaining',
    message: 'Your timer will complete in one minute!',
    priority: 1
  };
  chrome.notifications.create(options);
}

function focusBrowserWindow(window) {
  if (window) {
    chrome.windows.update(window.id, { focused: true });
  }
}

function saveState() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isRunning = timer !== null;
  chrome.storage.local.set({ minutes, seconds, isRunning });
}

chrome.storage.local.get(['minutes', 'seconds', 'isRunning'], (result) => {
  if (result.isRunning) {
    startTimer(result.minutes + result.seconds / 60);
  }
});