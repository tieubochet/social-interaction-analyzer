document.addEventListener('DOMContentLoaded', () => {
  const postUrlInput = document.getElementById('postUrl');
  const usernameInput = document.getElementById('username');
  const scanButton = document.getElementById('scanButton');
  const statusDiv = document.getElementById('status');
  const followersList = document.getElementById('followersList');
  const nonFollowersList = document.getElementById('nonFollowersList');
  const resultsContainer = document.getElementById('resultsContainer');

  scanButton.addEventListener('click', async () => {
    const yourUsername = usernameInput.value.trim().replace(/^@/, ''); // Remove leading @ if present

    if (!yourUsername) {
      statusDiv.textContent = 'Please enter your X Username.';
      return;
    }

    // Clear previous results and show loading state
    statusDiv.textContent = 'Scanning page for usernames...';
    followersList.innerHTML = '';
    nonFollowersList.innerHTML = '';
    resultsContainer.style.display = 'none'; // Hide results during scan
    scanButton.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes('x.com')) {
        statusDiv.textContent = 'Error: Please navigate to an x.com page.';
        scanButton.disabled = false;
        return;
      }

      // Inject the script to scan for usernames on the page
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const usernames = new Set();
          // A broad but effective selector for capturing @mentions within spans
          document.querySelectorAll('span').forEach(span => {
            const text = span.textContent.trim();
            if (text.startsWith('@')) {
              // Extract the username part (alphanumeric and underscores)
              const potentialUsername = text.substring(1).split(/[^a-zA-Z0-9_]/)[0];
              // Basic validation for a typical username (1-15 chars)
              if (potentialUsername.length > 0 && potentialUsername.length <= 15) {
                usernames.add(potentialUsername);
              }
            }
          });
          return Array.from(usernames);
        }
      });

      const allScannedUsers = injectionResults[0].result || [];

      if (allScannedUsers.length === 0) {
        statusDiv.textContent = 'Scan complete! No usernames found on the page.';
        scanButton.disabled = false;
        return;
      }

      // Remove the user's own username from the list to be checked
      const usersToCheck = allScannedUsers.filter(u => u.toLowerCase() !== yourUsername.toLowerCase());

      statusDiv.textContent = `Found ${usersToCheck.length} unique users. Simulating follower check...`;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // --- IMPORTANT MOCK ---
      // This part is a simulation. A real follower check requires a backend
      // server and authenticated access to the X/Twitter API.
      const simulatedResults = {
        followers: [],
        nonFollowers: [],
      };

      // Simple simulation: every third user is categorized as a follower for demonstration.
      usersToCheck.forEach((user, index) => {
        if (index % 3 === 0) {
          simulatedResults.followers.push(user);
        } else {
          simulatedResults.nonFollowers.push(user);
        }
      });
      // --- END MOCK ---

      statusDiv.textContent = 'Scan complete!';

      // Populate lists
      simulatedResults.followers.forEach(user => {
        const p = document.createElement('p');
        p.textContent = `@${user}`;
        followersList.appendChild(p);
      });

      simulatedResults.nonFollowers.forEach(user => {
        const p = document.createElement('p');
        p.textContent = `@${user}`;
        nonFollowersList.appendChild(p);
      });

      // Show the results container
      resultsContainer.style.display = 'flex';

    } catch (error) {
      console.error('Error during scan:', error);
      statusDiv.textContent = `An error occurred. Check the console for details.`;
      if (error.message.includes('Cannot access contents of url')) {
          statusDiv.textContent = 'Error: Extension cannot access this page. Please reload the page and try again.';
      }
    } finally {
      scanButton.disabled = false;
    }
  });
});
