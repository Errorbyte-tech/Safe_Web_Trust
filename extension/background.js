chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scanSite') {
    fetch('http://localhost:5000/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: message.url })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    // Required to indicate asynchronous response
    return true;
  }
});
