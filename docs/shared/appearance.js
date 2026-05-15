(() => {
  const root = document.documentElement;
  const storageKey = "colorMode";
  const modes = ["auto", "light", "dark"];
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const getMode = () => {
    const saved = localStorage.getItem(storageKey);
    return modes.includes(saved) ? saved : "auto";
  };

  const resolveMode = (mode) => {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return media?.matches ? "dark" : "light";
  };

  const applyMode = (mode, emit = true) => {
    const resolved = resolveMode(mode);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-mode", mode);
    if (emit) document.dispatchEvent(new CustomEvent("colorModeChange", { detail: { mode, resolved } }));
  };

  const setMode = (mode) => {
    const next = modes.includes(mode) ? mode : "auto";
    localStorage.setItem(storageKey, next);
    applyMode(next);
  };

  const isDark = () => resolveMode(getMode()) === "dark";

  const updateSwitcher = (btn) => {
    if (!btn) return;
    const mode = getMode();
    const icon = mode === "auto" ? "sun-moon" : mode === "light" ? "sun" : "moon";
    btn.dataset.mode = mode;
    btn.setAttribute("aria-label", `Appearance: ${mode}`);
    btn.setAttribute("title", `Appearance: ${mode}`);
    btn.innerHTML = `<i data-lucide="${icon}"></i>`;
    window.lucide?.createIcons?.();
  };

  const mountSwitcher = () => document.querySelector(".mode-switcher");

  const bindSwitcher = () => {
    const btn = mountSwitcher();
    if (!btn || btn._bound) return;
    btn._bound = true;
    updateSwitcher(btn);
    btn.addEventListener("click", () => {
      const mode = getMode();
      const next = modes[(modes.indexOf(mode) + 1) % modes.length];
      setMode(next);
      updateSwitcher(btn);
    });
    document.addEventListener("colorModeChange", () => updateSwitcher(btn));

    if (media) {
      const handler = () => {
        if (getMode() === "auto") {
          applyMode("auto");
          updateSwitcher(btn);
        }
      };
      if (typeof media.addEventListener === "function") media.addEventListener("change", handler);
      else if (typeof media.addListener === "function") media.addListener(handler);
    }

    window.addEventListener("storage", (e) => {
      if (e.key !== storageKey) return;
      applyMode(getMode());
      updateSwitcher(btn);
    });
  };

  const init = () => {
    applyMode(getMode(), false);
    bindSwitcher();
  };

  window.Appearance = { getMode, setMode, isDark, bindSwitcher };
  init();
})();
