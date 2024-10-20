const faStylesheet = document.createElement('link');
faStylesheet.rel = 'stylesheet';
faStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(faStylesheet);

const fakeNewsKeywords = ["fake news", "clickbait", "rumor", "hoax", "conspiracy", "unverified"];

function checkIfFactCheckingIsDisabled() {
  const currentSite = window.location.hostname;
  chrome.storage.sync.get([`disable_${currentSite}`], (result) => {
    if (result[`disable_${currentSite}`]) {
      console.log('Fact-checking is disabled for this site.');
      removeUnderlines();
    } else {
      underlineFakeNews();
    }
  });
}

function underlineFakeNews() {
  const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span");

  elements.forEach((element) => {
    fakeNewsKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      element.innerHTML = element.innerHTML.replace(regex, (match) => {
        return `<span style="text-decoration: underline; 
                         text-decoration-color: red; 
                         text-decoration-style: wavy;">${match}</span>`;
      });
    });
  });
}

checkIfFactCheckingIsDisabled();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightFakeNews') {
    underlineFakeNews();
  } else if (request.action === 'removeHighlights') {
    removeUnderlines();
  }
});

function removeUnderlines() {
  const underlinedElements = document.querySelectorAll('span[style*="text-decoration:"]');
  underlinedElements.forEach((element) => {
    element.outerHTML = element.innerHTML;
  });
}

function checkIfSiteIsFlaggedAsFake() {
  const currentSite = window.location.hostname;
  chrome.storage.sync.get([`fake_${currentSite}`], (result) => {
    if (result[`fake_${currentSite}`]) {
      console.log('This site is flagged as fake.');
      displayWarningMessage();
    }
  });
}

function displayWarningMessage() {
  const warningMessage = document.createElement('div');
  warningMessage.innerHTML = 'This site has been flagged as fake!';
  warningMessage.style = `
    background-color: red;
    color: white;
    padding: 10px;
    border-radius: 10px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 9999;
  `;
  document.body.appendChild(warningMessage);
}

const tooltip = document.createElement('div');
tooltip.id = 'hoverTooltip';
tooltip.innerHTML = `
  <button id="closeTooltipBtn" class="tooltip-icon-btn"><i class="fa fa-power-off" style="color: #52b788;;"></i></button>
  <button id="toggleMarkBtn" class="tooltip-btn">Mark as False</button>
  <button id="checkReliabilityBtn" class="tooltip-btn">Check Reliability</button>
`;
tooltip.style = `
  display: none;
  position: absolute;
  background-color: #333;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, transform 0.2s ease-in-out;
  transform: translateY(-10px);
  white-space: nowrap;
`;

// Append the tooltip to the body
document.body.appendChild(tooltip);

// CSS styles for the tooltip buttons
const tooltipStyles = `
  .tooltip-btn {
    background-color: #74c69d;
    color: white;
    border: none;
    padding: 6px 12px;
    margin: 2px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  .tooltip-btn:hover {
    background-color: #52b788;
    transform: scale(1.05);
  }
  .tooltip-btn:active {
    background-color: #3e8e41;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .tooltip-icon-btn {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-right: 1px;
    position: absolute;
    right: 0.1px;
    bottom: 37px;
  }
  .tooltip-icon-btn:hover {
    transform: scale(1.01)
    color: #74c69d
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerHTML = tooltipStyles;
document.head.appendChild(styleSheet);

let selectedText = "";

function showTooltip(event) {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    tooltip.style.top = `${window.scrollY + rect.bottom + 10}px`;
    tooltip.style.left = `${window.scrollX + rect.left}px`;
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';

    selectedText = selection.toString().trim();

    const isUnderlined = isTextUnderlined(selectedText);
    document.getElementById('toggleMarkBtn').textContent = isUnderlined
      ? 'Mark as True'
      : 'Mark as False';
  } else {
    hideTooltip();
  }
}

function isTextUnderlined(text) {
  const spans = document.querySelectorAll('span.underlinedText');
  return Array.from(spans).some((span) => span.textContent === text);
}

document.getElementById('toggleMarkBtn').addEventListener('click', () => {
  if (selectedText) {
    const isUnderlined = isTextUnderlined(selectedText);
    if (isUnderlined) {
      removeUnderline(selectedText);
    } else {
      underlineSelectedText();
    }
    hideTooltip();
  }
});

document.getElementById('checkReliabilityBtn').addEventListener('click', () => {
  alert(`Checking reliability for: "${selectedText}"`);
});

document.getElementById('closeTooltipBtn').addEventListener('click', () => {
  hideTooltip();
});

function underlineSelectedText() {
  const range = window.getSelection().getRangeAt(0);
  const span = document.createElement('span');
  span.className = 'underlinedText';
  span.style.textDecoration = 'underline wavy red';
  span.textContent = selectedText;
  range.deleteContents();
  range.insertNode(span);
  chrome.storage.local.set({ [selectedText]: true });
}

function removeUnderline(text) {
  const spans = document.querySelectorAll('span.underlinedText');
  spans.forEach((span) => {
    if (span.textContent === text) {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.textContent), span);
    }
  });
  chrome.storage.local.remove(text);
}

function hideTooltip() {
  tooltip.style.opacity = '0';
  tooltip.style.transform = 'translateY(-5px)';
  setTimeout(() => (tooltip.style.display = 'none'), 300);
}

document.addEventListener('mouseup', showTooltip);

document.addEventListener('mousedown', (event) => {
  if (!tooltip.contains(event.target)) {
    hideTooltip();
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'disableExtension') {
    removeAllUnderlines();
  }
});

function removeAllUnderlines() {
  const spans = document.querySelectorAll('span.underlinedText');
  spans.forEach((span) => {
    const parent = span.parentNode;
    parent.replaceChild(document.createTextNode(span.textContent), span);
  });
}

checkIfSiteIsFlaggedAsFake();
