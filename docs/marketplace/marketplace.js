document.addEventListener("DOMContentLoaded", async () => {
  // --- Utilities ---

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const fetchJSON = (path) =>
    fetch(path)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  const mdLinks = (t) => (t ? t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : "No description available.");
  const isDark = () => window.Appearance?.isDark?.() ?? (localStorage.getItem("colorMode") === "dark" || window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  const pickImageSrc = (img) => {
    const { light, dark, base } = img.dataset;
    return isDark() ? dark || light || base : light || dark || base;
  };

  // --- DOM Helpers ---

  const PALETTE_VARS = ["background-primary", "background-primary-alt", "background-secondary", "background-secondary-alt", "text-normal", "text-muted", "text-faint", "interactive-normal", "interactive-hover", "background-modifier-border", "color-red", "color-yellow", "color-green"];
  const pe = window.BaselinePaletteExtractor;

  const applyPaletteVars = (el, data, mode) => {
    if (!el || !data) return;
    PALETTE_VARS.forEach((k) => {
      const v = data[`baseline-style@@${k}@@${mode}`];
      v ? el.style.setProperty(`--${k}`, v) : el.style.removeProperty(`--${k}`);
    });
  };

  const initImageLoader = (picture) => {
    const img = picture.querySelector("img");
    if (!img) return;
    const src = pickImageSrc(img);
    const loader = picture.querySelector(".preset-preview-loader");

    if (!src) {
      loader?.remove();
      return;
    }
    if (img.dataset.currentSrc === src) return;

    img.onload = () => loader?.remove();
    img.onerror = () => loader?.remove();

    img.src = src;
    img.dataset.currentSrc = src;
  };

  const setActive = (el, isActive) => {
    el.classList.toggle("is-active", isActive);
    if (!el.className) el.removeAttribute("class");
  };

  const flashCopy = (el) => {
    if (!el) return;
    const iconEl = el.querySelector("[data-lucide]");
    if (iconEl) {
      if (!el._origIcon) el._origIcon = iconEl.getAttribute("data-lucide");
      iconEl.setAttribute("data-lucide", "circle-check");
      lucide.createIcons({ root: el });
    }
    if (el._copyTimeout) clearTimeout(el._copyTimeout);
    el._copyTimeout = setTimeout(() => {
      const iconEl = el.querySelector("[data-lucide]");
      if (iconEl && el._origIcon) {
        iconEl.setAttribute("data-lucide", el._origIcon);
        lucide.createIcons({ root: el });
      }
      delete el.dataset.copying;
    }, 1000);
  };

  const copyToClipboard = (payload, triggerEl, eventName, eventData) => {
    const restore = () => {
      if (triggerEl) {
        const iconEl = triggerEl.querySelector("[data-lucide]");
        if (iconEl && triggerEl._origIcon) {
          iconEl.setAttribute("data-lucide", triggerEl._origIcon);
          lucide.createIcons({ root: triggerEl });
        }
        delete triggerEl.dataset.copying;
      }
    };

    if (!payload || !Object.keys(payload).length) {
      restore();
      return;
    }
    navigator.clipboard
      .writeText(JSON.stringify(payload, null, 2))
      .then(() => {
        flashCopy(triggerEl);
        if (eventName) window.gtag?.("event", eventName, eventData);
      })
      .catch(restore);
  };

  // --- Panel Builders ---

  const buildAuthorEl = (item) => {
    if (item.authorUrl) {
      return Object.assign(document.createElement("a"), { href: item.authorUrl, textContent: item.author, className: "preset-author" });
    }
    return Object.assign(document.createElement("span"), { textContent: item.author || "Unknown", className: "preset-author" });
  };

  const buildPalettePreview = (svg, item, data) => {
    item.colors?.forEach((hex) => {
      svg.appendChild(Object.assign(document.createElement("div"), { className: "palette-color", style: `background-color:${hex}` }));
    });
    applyPaletteVars(svg, data, isDark() ? "dark" : "light");
  };

  const setupPaletteMenu = (menu, item, data) => {
    const menuId = `palette-menu-${item.id}`;
    menu.id = menuId;
    menu.dataset.preset = item.id;
    menu.previousElementSibling?.querySelector(".palette-menu-btn")?.setAttribute("popovertarget", menuId);
    [
      ["dynamic", "light", pe?.hasDynamicMode(data, "light")],
      ["dynamic", "dark", pe?.hasDynamicMode(data, "dark")],
      ["static", "light", pe?.hasStaticMode(data, "light")],
      ["static", "dark", pe?.hasStaticMode(data, "dark")],
    ].forEach(([kind, mode, visible]) => {
      const opt = menu.querySelector(`[data-kind="${kind}"][data-mode="${mode}"]`);
      if (opt) visible ? opt.removeAttribute("hidden") : opt.remove();
    });
  };

  const buildPanel = (item, data) => {
    const isPalette = item.type === "palette";
    const template = $(`.${isPalette ? "palette" : "preset"}-template`);
    if (!template) return null;

    const clone = template.content.cloneNode(true);
    const panel = clone.querySelector(".preset-panel");
    panel.dataset.preset = item.id;
    panel.dataset.type = item.type;
    clone.querySelector(".preset-title").textContent = item.name;
    clone.querySelector(".preset-description").innerHTML = mdLinks(item.description);
    clone.querySelector(".preset-author").replaceWith(buildAuthorEl(item));

    if (isPalette) {
      buildPalettePreview(clone.querySelector(".preset-preview svg"), item, data);
      const menu = clone.querySelector(".menu");
      if (menu && data) setupPaletteMenu(menu, item, data);
    } else {
      const img = clone.querySelector("img");
      if (item.imageDark) {
        clone.querySelector('source[media*="dark"]').dataset.srcset = item.imageDark;
        img.dataset.dark = item.imageDark;
      }
      if (item.imageLight) {
        clone.querySelector('source[media*="light"]').dataset.srcset = item.imageLight;
        img.dataset.light = item.imageLight;
      }
      if (item.imageBase) img.dataset.base = item.imageBase;
    }

    return clone;
  };

  // --- State & Config ---

  const container = $(".content");
  const searchInput = $(".preset-search");
  const searchBtn = $(".preset-search-btn");
  const searchMenu = $("#preset-search-menu");
  const lightbox = $("#lightbox");
  const lightboxImg = $(".lightbox-img", lightbox);
  const lightboxTitle = $(".lightbox-title", lightbox);

  let items = [],
    itemDetails = {},
    debounceTimer;
  const activeTypes = new Set(["preset", "palette"]);
  let currentFilter = 0;

  const FILTER_MODES = ["new", "old", "a-z", "z-a"];
  const FILTER_LABELS = { new: "New → Old", old: "Old → New", "a-z": "A → Z", "z-a": "Z → A" };
  const TYPE_LABELS = { preset: "Style Preset Only", palette: "Color Palette Only" };
  const PLACEHOLDERS = { all: "Search style presets & color palettes...", preset: "Search style presets...", palette: "Search color palettes..." };

  // --- Rendering ---

  const getActiveType = () => (activeTypes.size === 1 ? [...activeTypes][0] : null);

  const updateControls = () => {
    const t = getActiveType();
    searchBtn.innerHTML = `<i data-lucide="list-filter"></i>${t ? TYPE_LABELS[t] : "All"} · ${FILTER_LABELS[FILTER_MODES[currentFilter]]}`;
    searchInput.placeholder = PLACEHOLDERS[t || "all"];
  };

  const render = (updateIcons = true) => {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = items.slice();
    if (FILTER_MODES[currentFilter] === "new") filtered.reverse();
    else if (FILTER_MODES[currentFilter] === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (FILTER_MODES[currentFilter] === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));
    filtered = filtered.filter((i) => activeTypes.has(i.type) && (!query || i.searchable.includes(query)));

    container.innerHTML = "";
    filtered.forEach((i) => {
      const el = buildPanel(i, itemDetails[i.id]);
      if (el) container.appendChild(el);
    });
    $$(".preset-panel[data-type='preset'] picture", container).forEach(initImageLoader);
    if (updateIcons) lucide.createIcons();
  };

  // --- Event Handlers ---

  searchMenu?.addEventListener("click", (e) => {
    const filterItem = e.target.closest("[data-filter]");
    const sortItem = e.target.closest("[data-sort]");

    if (filterItem) {
      const type = filterItem.dataset.filter;
      if (!type) return;
      activeTypes.has(type) && activeTypes.size === 1 ? (activeTypes.clear(), activeTypes.add(type === "preset" ? "palette" : "preset")) : activeTypes.has(type) ? activeTypes.delete(type) : activeTypes.add(type);
      $$("[data-filter]", searchMenu).forEach((el) => setActive(el, activeTypes.has(el.dataset.filter)));
    } else if (sortItem) {
      const next = FILTER_MODES.indexOf(sortItem.dataset.sort);
      if (next === -1) return;
      currentFilter = next;
      $$("[data-sort]", searchMenu).forEach((el) => setActive(el, el.dataset.sort === FILTER_MODES[currentFilter]));
    } else return;

    updateControls();
    render();
    lucide.createIcons();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchInput.value.trim();
      const url = new URL(window.location);
      query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
      render();
    }, 150);
  });

  container.addEventListener("click", async (e) => {
    const menuItem = e.target.closest("[data-kind]");
    if (menuItem) {
      if (menuItem.dataset.copying) return;

      const { preset: id } = menuItem.closest(".menu")?.dataset ?? {};
      const { mode, kind } = menuItem.dataset;
      if (!id || !mode || !kind || !pe) return;

      menuItem.dataset.copying = "true";

      const payload = kind === "dynamic" ? pe.extractDynamicPalette(itemDetails[id], mode) : pe.extractStaticPalette(itemDetails[id], mode);
      copyToClipboard(payload, menuItem, "palette_copy", { palette: id, mode, kind });
      return;
    }

    const btn = e.target.closest("button");
    const panel = e.target.closest(".preset-panel");
    const picture = e.target.closest("picture");

    if (panel && btn?.closest(".copy-btn")) {
      if (btn.dataset.copying) return;

      const { preset: id, type } = panel.dataset;
      btn.dataset.copying = "true";

      if (type === "palette") {
        const payload = {};
        ["light", "dark"].forEach((m) => {
          const p = pe?.extractDynamicPalette(itemDetails[id], m);
          if (p) Object.assign(payload, p);
        });
        copyToClipboard(payload, btn, "palette_copy", { palette: id, kind: "dynamic", mode: "auto" });
      } else {
        if (!itemDetails[id]) itemDetails[id] = await fetchJSON(`preset/${id}.json`);
        copyToClipboard(itemDetails[id], btn, "preset_copy", { preset: id });
      }
    } else if (picture) {
      const img = picture.querySelector("img");
      if (img) {
        lightboxImg.src = pickImageSrc(img);
        lightboxTitle.textContent = panel?.querySelector(".preset-title")?.textContent || "";
        lightbox.showPopover();
      }
    }
  });

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === lightboxImg) lightbox.hidePopover();
  });
  lightbox?.addEventListener("toggle", (e) => document.body.classList.toggle("lightbox-active", e.newState === "open"));

  document.addEventListener("colorModeChange", () => {
    const mode = isDark() ? "dark" : "light";
    $$(".preset-panel[data-type='preset'] picture", container).forEach(initImageLoader);
    $$(".preset-panel[data-type='palette'] .preset-preview svg", container).forEach((svg) => {
      applyPaletteVars(svg, itemDetails[svg.closest(".preset-panel").dataset.preset], mode);
    });
    if (lightbox?.matches(":popover-open")) lightboxImg.src = pickImageSrc(lightboxImg);
  });

  // --- Init ---

  const manifest = await fetchJSON("preset.json");
  if (!manifest) return;

  items = await Promise.all(
    Object.entries(manifest).map(async ([id, meta]) => {
      const isPalette = meta.type === "palette";
      if (isPalette) itemDetails[id] = (await fetchJSON(`preset/${id}.json`)) || {};
      return {
        id,
        type: meta.type || "preset",
        name: meta.name,
        author: meta.author || "Unknown",
        authorUrl: meta.url || null,
        description: meta.description || "No description available.",
        colors: isPalette ? itemDetails[id].colors || [] : null,
        imageBase: !isPalette ? `img/${id}.png` : null,
        imageDark: !isPalette ? `img/${id}@dark.png` : null,
        imageLight: !isPalette ? `img/${id}@light.png` : null,
        searchable: `${id} ${meta.name} ${meta.author || ""} ${meta.description || ""}`.toLowerCase(),
      };
    }),
  );

  const initialQuery = new URLSearchParams(window.location.search).get("q");
  if (initialQuery) searchInput.value = initialQuery;
  updateControls();
  render(false);
  lucide.createIcons();
});
