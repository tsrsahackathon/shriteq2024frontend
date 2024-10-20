const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?apiKey=${NEWS_API_KEY}&q=`;

// Function to calculate the reliability score
function calculateReliabilityScore() {
  const score = Math.floor(Math.random() * 80) + 15; // Random score between 0 and 100
  document.getElementById('reliabilityScore').textContent = score + '%';

  // Update the progress bar based on the score
  updateProgressBar(score);

  // Highlight fake news
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightFakeNews', score: score });
  });
}

// Update progress bar
function updateProgressBar(score) {
  const progressFill = document.querySelector('.progress-fill');
  progressFill.style.width = `${score}%`;
  
  // Change color based on score
  if (score >= 70) {
    progressFill.style.backgroundColor = 'green'; // High reliability
  } else if (score >= 40) {
    progressFill.style.backgroundColor = 'orange'; // Moderate reliability
  } else {
    progressFill.style.backgroundColor = 'red'; // Low reliability
  }
}

// Flag to track if highlights are disabled
let highlightsDisabled = false;

// Call this function when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  calculateReliabilityScore();
});

// Scan for fake news button functionality
document.getElementById('scanBtn').addEventListener('click', () => {
  if (highlightsDisabled) {
    highlightsDisabled = false; // Re-enable highlights
    alert('Fact-checking has been re-enabled for this site.');
  }

  calculateReliabilityScore();
});

// Disable fact-checking and remove highlights
document.getElementById('disableBtn').addEventListener('click', () => {
  highlightsDisabled = true; // Set the flag to true
  removeHighlightsAndDisableFactChecking();
});

// Function to remove highlights and disable fact-checking for this site
function removeHighlightsAndDisableFactChecking() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'removeHighlights' });
  });

  const currentSite = window.location.hostname;
  chrome.storage.sync.set({ [`disable_${currentSite}`]: true }, () => {
    alert('Fact-checking has been disabled for this site');
  });
}

// Function to find reliable news
document.getElementById('newsBtn').addEventListener('click', () => {
  // Implement functionality to find reliable news
  alert('Reliable news functionality not implemented yet.');
})

// Flag site as fake functionality
document.getElementById('flagBtn').addEventListener('click', () => {
    const currentSite = window.location.hostname;
    chrome.storage.sync.set({ [`fake_${currentSite}`]: true }, () => {
      alert('Site flagged as fake!');
    });
  });

  document.getElementById('disableBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'disableExtension' });
    });
  });
  