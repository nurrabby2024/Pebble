
(function () {
  const STORAGE_KEY = 'pebble-v1';
  const streakEl = document.getElementById('streak');
  const statusEl = document.getElementById('status');
  const envLabel = document.getElementById('env-label');

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { today: null, last7: [] };
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Pebble] failed to load state', e);
      return { today: null, last7: [] };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[Pebble] failed to save state', e);
    }
  }

  function renderStreak(last7) {
    if (!streakEl) return;
    streakEl.innerHTML = '';
    const days = 7;
    const padded = [...last7];
    while (padded.length < days) {
      padded.unshift(null);
    }
    padded.slice(-days).forEach((type) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (type) dot.dataset.type = type;
      streakEl.appendChild(dot);
    });
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function init() {
    const state = loadState();
    renderStreak(state.last7 || []);
    if (state.today) {
      setStatus('Today: ' + state.today.toUpperCase());
    }

    document.querySelectorAll('button.mood').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const now = new Date();
        const todayKey = now.toISOString().slice(0, 10);

        let current = loadState();
        const entry = { date: todayKey, type };

        const withoutToday = (current.last7 || []).filter((e) => e && e.date !== todayKey);
        const updated = [...withoutToday, entry].slice(-7);

        current = { today: type, last7: updated };
        saveState(current);
        renderStreak(current.last7);
        setStatus('Today: ' + type.toUpperCase());
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // envLabel is updated by script.js if running in Mini App
  if (envLabel) {
    envLabel.textContent = 'web';
  }
})();
