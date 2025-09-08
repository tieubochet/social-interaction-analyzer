document.getElementById('save').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value.trim();
  chrome.storage.sync.set({ geminiApiKey: key }, () => {
    alert('Đã lưu API Key!');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['geminiApiKey'], ({ geminiApiKey }) => {
    if (geminiApiKey) {
      document.getElementById('apiKey').value = geminiApiKey;
    }
  });
});