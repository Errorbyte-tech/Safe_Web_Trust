(async () => {
  const url = window.location.href;

  chrome.runtime.sendMessage({ type: 'scanSite', url }, (response) => {
    if (response && response.success) {
      const riskScore = response.data.riskScore;
      showOverlay(riskScore);
    } else {
      console.error('Scan error:', response?.error);
    }
  });

  function showOverlay(score) {
    const color =
      score > 70 ? 'red'
      : score > 30 ? 'orange'
      : 'green';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.backgroundColor = color;
    overlay.style.color = '#fff';
    overlay.style.padding = '8px 16px';
    overlay.style.borderRadius = '5px';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.zIndex = 100000;
    overlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
    overlay.textContent = `Safe WebTrust risk: ${score}`;

    document.body.appendChild(overlay);

  }
})();
