(() => {
  try {
    const saved = localStorage.getItem('anc-theme');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F3ECE1' : '#211E1A');
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
