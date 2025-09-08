
document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const scanButton = document.getElementById('scanButton');
  const statusDiv = document.getElementById('status');
  const followersList = document.getElementById('followersList');
  const nonFollowersList = document.getElementById('nonFollowersList');
  const resultsContainer = document.getElementById('resultsContainer');

  let isScanning = false;
  const allFoundUsernames = new Set();

  // This function is injected to scan the page for usernames.
  // It's more targeted, using specific data-testid attributes for better accuracy.
  const scanPageForUsers = () => {
    const usernames = new Set();
    // This selector is more precise, targeting the specific data-testid for user identification blocks.
    document.querySelectorAll('article[data-testid="tweet"] div[data-testid="User-Name"] span').forEach(span => {
      const text = span.textContent.trim();
      if (text.startsWith('@')) {
        const username = text.substring(1);
        // X.com usernames are 4 to 15 characters long and can only contain alphanumeric characters and underscores.
        if (/^[a-zA-Z0-9_]{4,15}$/.test(username)) {
            usernames.add(username);
        }
      }
    });
    return Array.from(usernames);
  };
  
  // This function is injected to scroll down and intelligently wait for new content to finish loading.
  const scrollAndWait = () => {
    return new Promise((resolve) => {
      const initialHeight = document.body.scrollHeight;
      window.scrollTo(0, initialHeight);

      let lastHeight = initialHeight;
      let retries = 0;
      // Wait up to 5 seconds (25 * 200ms) of no change to be sure loading is complete.
      const maxRetries = 25; 

      const intervalId = setInterval(() => {
        const newHeight = document.body.scrollHeight;
        if (newHeight > lastHeight) {
          // The page is still growing, so we reset our counter.
          lastHeight = newHeight;
          retries = 0;
        } else {
          // The page has not grown, increment counter.
          retries++;
        }

        if (retries >= maxRetries) {
          // If the page height has been stable for a while, we assume it's done loading.
          clearInterval(intervalId);
          resolve({ initialHeight, newHeight: lastHeight });
        }
      }, 200);
    });
  };

  // This function is injected into the X.com page to find and click a follow button.
  const followUserOnPage = (usernameToFollow) => {
    const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    let buttonClicked = false;

    for (const article of articles) {
      const userLink = article.querySelector(`a[href="/${usernameToFollow}"]`);
      const isUserIdentifier = userLink && userLink.closest('div[data-testid="User-Name"]');

      if (isUserIdentifier) {
        const followButton = article.querySelector('button[data-testid$="-follow"]');
        if (followButton && followButton.textContent.toLowerCase() === 'follow') {
          followButton.click();
          buttonClicked = true;
          break;
        }
      }
    }

    if (buttonClicked) {
      return { success: true, username: usernameToFollow };
    } else {
      return { success: false, username: usernameToFollow, message: `Could not find an active 'Follow' button for @${usernameToFollow}. They might already be followed or their comment isn't visible.` };
    }
  };

  // This function processes the found users and displays them.
  const processUsers = (users) => {
    const yourUsername = usernameInput.value.trim().replace(/^@/, '');
    const usersToCheck = users.filter(u => u.toLowerCase() !== yourUsername.toLowerCase());

    if (usersToCheck.length === 0) {
      statusDiv.textContent = 'Scan complete! No other usernames were found.';
      return;
    }

    statusDiv.textContent = `Scan complete! Found ${usersToCheck.length} unique users. Simulating follower check...`;

    // This is a placeholder for actually checking followers.
    // For now, it splits users for demonstration purposes.
    const simulatedResults = { followers: [], nonFollowers: [] };
    usersToCheck.forEach((user, index) => {
      if (index % 3 === 0) {
        simulatedResults.followers.push(user);
      } else {
        simulatedResults.nonFollowers.push(user);
      }
    });

    followersList.innerHTML = simulatedResults.followers.length > 0
        ? simulatedResults.followers.map(user => `<div class="user-item"><p>@${user}</p></div>`).join('')
        : '<p>None found.</p>';

    nonFollowersList.innerHTML = simulatedResults.nonFollowers.length > 0
        ? simulatedResults.nonFollowers.map(user => `
            <div class="user-item">
                <p>@${user}</p>
                <button class="follow-button" data-username="${user}">Follow</button>
            </div>
            `).join('')
        : '<p>None found.</p>';

    resultsContainer.style.display = 'flex';
  };

  // The main loop that orchestrates the scanning and scrolling process.
  // This loop is now more robust, stopping only when it's confident it has reached the end.
  const scanLoop = async (tabId) => {
    let previousUserCount = -1;
    let consecutiveIdleLoops = 0;
    const MAX_IDLE_LOOPS = 3; // Stop after 3 full scroll cycles with no new users or content.

    while (consecutiveIdleLoops < MAX_IDLE_LOOPS) {
      previousUserCount = allFoundUsernames.size;

      // 1. Scan the currently visible content.
      const scanInjection = await chrome.scripting.executeScript({
        target: { tabId },
        func: scanPageForUsers,
      });
      (scanInjection[0].result || []).forEach(u => allFoundUsernames.add(u));
      statusDiv.textContent = `Scanning... Found ${allFoundUsernames.size} unique users. Scrolling down...`;

      // 2. Scroll down and wait for the page to settle.
      const scrollResultInjection = await chrome.scripting.executeScript({
        target: { tabId },
        func: scrollAndWait
      });
      const { initialHeight, newHeight } = scrollResultInjection[0].result;

      // 3. Determine if we've made progress. Progress means finding new users or the page growing.
      const foundNewUsers = allFoundUsernames.size > previousUserCount;
      const pageGrew = newHeight > initialHeight;

      if (foundNewUsers || pageGrew) {
        consecutiveIdleLoops = 0; // Reset counter because we're still finding things.
      } else {
        consecutiveIdleLoops++; // No new users and no new content, we might be at the end.
        statusDiv.textContent = `No new content found (${consecutiveIdleLoops}/${MAX_IDLE_LOOPS}). Verifying end of page...`;
      }
    }

    // A final scan to catch any stragglers after the last scroll.
    const finalScan = await chrome.scripting.executeScript({ target: { tabId }, func: scanPageForUsers });
    (finalScan[0].result || []).forEach(u => allFoundUsernames.add(u));

    processUsers(Array.from(allFoundUsernames));
  };

  // The main button event listener.
  scanButton.addEventListener('click', async () => {
    if (isScanning) return;

    const yourUsername = usernameInput.value.trim();
    if (!yourUsername) {
      statusDiv.textContent = 'Please enter your X Username.';
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || !tab.url || !tab.url.includes('x.com')) {
      statusDiv.textContent = 'Error: Please navigate to an x.com page and try again.';
      return;
    }

    isScanning = true;
    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
    statusDiv.textContent = 'Initiating scan...';
    followersList.innerHTML = '';
    nonFollowersList.innerHTML = '';
    resultsContainer.style.display = 'none';
    allFoundUsernames.clear();

    try {
      await scanLoop(tab.id);
    } catch (error) {
      console.error('Error during scan:', error);
      statusDiv.textContent = 'An error occurred. Check the console for details.';
    } finally {
      isScanning = false;
      scanButton.disabled = false;
      scanButton.textContent = 'Start Scan';
    }
  });

  // Event handler for clicking the 'Follow' button on the non-followers list.
  nonFollowersList.addEventListener('click', async (event) => {
    if (!event.target.matches('.follow-button:not(:disabled)')) {
        return; // Exit if the click is not on an active follow button
    }

    const button = event.target;
    const usernameToFollow = button.dataset.username;

    button.disabled = true;
    button.textContent = 'Following...';

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab) {
      console.error("No active tab found.");
      button.textContent = 'Error';
      return;
    }

    try {
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: followUserOnPage,
            args: [usernameToFollow]
        });

        if (chrome.runtime.lastError) {
            throw new Error(chrome.runtime.lastError.message);
        }

        const result = injectionResults[0].result;
        if (result && result.success) {
            button.textContent = 'Followed';
            button.classList.add('followed');
        } else {
            button.textContent = 'Error';
            button.title = result.message || 'Could not perform action.';
            console.error(result.message);
        }
    } catch (e) {
        console.error("Error during follow action:", e);
        button.textContent = 'Error';
        button.title = 'An unexpected error occurred. Check the console.';
    }
  });
});