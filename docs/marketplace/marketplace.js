document.addEventListener("DOMContentLoaded", async () => {
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
  const pe = window.BaselinePaletteExtractor;

  // Apply/remove palette CSS vars on a panel for the given mode
  const applyPaletteVars = (panel, p, mode) => {
    if (!panel || !p) return;
    const get = (k) => p[`baseline-style@@${k}@@${mode}`];

    // background-primary/secondary are swapped between light and dark
    const bp = get("background-primary"),
      bs = get("background-secondary");
    const [pri, sec] = mode === "dark" ? [bs, bp] : [bp, bs];
    const setOrRemove = (k, v) => (v ? panel.style.setProperty(k, v) : panel.style.removeProperty(k));
    setOrRemove("--background-primary", pri);
    setOrRemove("--background-secondary", sec);

    ["text-normal", "text-muted", "text-faint", "interactive-normal", "interactive-hover", "background-modifier-border"].forEach((k) => setOrRemove(`--${k}`, get(k)));
  };

  const initImageLoader = (picture) => {
    const img = picture.querySelector("img");
    if (!img) return;
    const src = pickImageSrc(img);
    if (!src) return picture.classList.remove("loading");
    const loader = new Image();
    loader.onload = () => {
      img.src = src;
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        picture.classList.remove("loading");
      });
    };
    loader.onerror = () => picture.classList.remove("loading");
    loader.src = src;
  };

  const setActive = (el, isActive) => {
    el.classList.toggle("is-active", isActive);
    if (!el.className) el.removeAttribute("class");
  };

  const flashCopy = (el) => {
    if (!el) return;
    const orig = el.innerHTML;
    el.innerHTML = "Copied!";
    setTimeout(() => {
      el.innerHTML = orig;
      lucide.createIcons();
    }, 1000);
  };

  const copyToClipboard = (payload, triggerEl, eventName, eventData) => {
    if (!payload || !Object.keys(payload).length) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      flashCopy(triggerEl);
      if (eventName) window.gtag?.("event", eventName, eventData);
    });
  };

  // Create Panel from Template
  const buildPanel = (item) => {
    const isPalette = item.type === "palette";
    const template = $(`.${isPalette ? "palette" : "preset"}-template`);
    if (!template) return null;

    const clone = template.content.cloneNode(true);
    const panel = clone.querySelector(".preset-panel");
    panel.dataset.preset = item.id;
    panel.dataset.type = item.type;
    clone.querySelector("h2").textContent = item.name;
    clone.querySelector(".preset-description").innerHTML = mdLinks(item.description);

    const authorEl = clone.querySelector(".preset-author");
    if (item.authorUrl) {
      const a = Object.assign(document.createElement("a"), { href: item.authorUrl, textContent: item.author });
      authorEl.replaceWith(a);
    } else {
      authorEl.textContent = item.author || "Unknown";
    }

    if (isPalette) {
      item.colors?.forEach((hex) => {
        const swatch = Object.assign(document.createElement("div"), { className: "palette-color" });
        swatch.style.backgroundColor = hex;
        clone.querySelector(".palette-preview").appendChild(swatch);
      });

      const menu = clone.querySelector(".palette-menu");
      const menuId = `palette-menu-${item.id}`;
      if (menu) {
        menu.id = menuId;
        menu.dataset.preset = item.id;
      }
      clone.querySelector(".palette-menu-btn")?.setAttribute("popovertarget", menuId);

      const paletteData = itemDetails[item.id];
      if (paletteData) applyPaletteVars(panel, paletteData, isDark() ? "dark" : "light");
      if (menu && pe && paletteData) {
        [
          ["dynamic", "light", pe.hasDynamicMode(paletteData, "light")],
          ["dynamic", "dark", pe.hasDynamicMode(paletteData, "dark")],
          ["static", "light", pe.hasStaticMode(paletteData, "light")],
          ["static", "dark", pe.hasStaticMode(paletteData, "dark")],
        ].forEach(([kind, mode, visible]) => {
          const opt = menu.querySelector(`[data-kind="${kind}"][data-mode="${mode}"]`);
          if (opt) visible ? opt.removeAttribute("hidden") : opt.remove();
        });
      }
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

  // State
  const container = $(".panel-container");
  const searchInput = $(".preset-search");
  const searchBtn = $(".preset-search-btn");
  const searchMenu = $("#preset-search-menu");
  const lightbox = $("#lightbox");
  const lightboxImg = $(".lightbox-img", lightbox);
  const lightboxTitle = $(".lightbox-title", lightbox);

  let items = [],
    itemDetails = {},
    debounceTimer;
  const filterModes = ["new", "old", "a-z", "z-a"];
  const filterLabels = { new: "New → Old", old: "Old → New", "a-z": "A → Z", "z-a": "Z → A" };
  const typeLabels = { preset: "Style Preset Only", palette: "Color Palette Only" };
  const placeholders = { all: "Search style presets & color palettes...", preset: "Search style presets...", palette: "Search color palettes..." };
  const activeTypes = new Set(["preset", "palette"]);
  let currentFilter = 0;

  const getActiveType = () => (activeTypes.size === 1 ? [...activeTypes][0] : null);

  const updateControls = () => {
    const activeType = getActiveType();
    searchBtn.innerHTML = `<i data-lucide="list-filter"></i>${activeType ? typeLabels[activeType] : "All"} · ${filterLabels[filterModes[currentFilter]]}`;
    searchInput.placeholder = placeholders[activeType || "all"];
    lucide.createIcons();
  };

  const render = () => {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = items.slice();
    if (filterModes[currentFilter] === "new") filtered.reverse();
    else if (filterModes[currentFilter] === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (filterModes[currentFilter] === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));
    filtered = filtered.filter((i) => activeTypes.has(i.type) && (!query || i.searchable.includes(query)));

    container.innerHTML = "";
    filtered.forEach((i) => {
      const el = buildPanel(i);
      if (el) container.appendChild(el);
    });
    lucide.createIcons();
    $$(".preset-panel[data-type='preset'] picture", container).forEach(initImageLoader);
  };

  // Event handlers
  searchMenu?.addEventListener("click", (e) => {
    const filterItem = e.target.closest("[data-filter]");
    const sortItem = e.target.closest("[data-sort]");

    if (filterItem) {
      const type = filterItem.dataset.filter;
      if (!type) return;
      if (activeTypes.has(type) && activeTypes.size === 1) {
        activeTypes.clear();
        activeTypes.add(type === "preset" ? "palette" : "preset");
      } else activeTypes.has(type) ? activeTypes.delete(type) : activeTypes.add(type);
      $$("[data-filter]", searchMenu).forEach((el) => setActive(el, activeTypes.has(el.dataset.filter)));
      updateControls();
      render();
    } else if (sortItem) {
      const next = filterModes.indexOf(sortItem.dataset.sort);
      if (next === -1) return;
      currentFilter = next;
      $$("[data-sort]", searchMenu).forEach((el) => setActive(el, el.dataset.sort === filterModes[currentFilter]));
      updateControls();
      render();
    }
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

  container.addEventListener("click", (e) => {
    const menuItem = e.target.closest("[data-kind]");
    if (menuItem) {
      const menu = menuItem.closest(".palette-menu");
      const { preset: id } = menu?.dataset ?? {};
      const { mode, kind } = menuItem.dataset;
      if (!id || !mode || !kind || !pe) return;
      const data = itemDetails[id];
      if (!data) return;
      const payload = kind === "dynamic" ? pe.extractDynamicPalette(data, mode) : pe.extractStaticPalette(data, mode);
      copyToClipboard(payload, menuItem, "palette_copy", { palette: id, mode, kind });
      return;
    }

    const btn = e.target.closest("button");
    const panel = e.target.closest(".preset-panel");
    const picture = e.target.closest("picture");

    if (panel && btn?.closest(".copy-btn")) {
      const { preset: id, type } = panel.dataset;
      const data = itemDetails[id];
      if (!data) return;
      if (type === "palette") {
        const output = {};
        ["light", "dark"].forEach((m) => {
          const p = pe?.extractDynamicPalette(data, m);
          if (p) Object.assign(output, p);
        });
        copyToClipboard(Object.keys(output).length ? output : null, btn, "palette_copy", { palette: id, kind: "dynamic", mode: "auto" });
      } else {
        copyToClipboard(data, btn, "preset_copy", { preset: id });
      }
    } else if (picture) {
      const img = picture.querySelector("img");
      if (img) {
        lightboxImg.src = pickImageSrc(img);
        lightboxTitle.textContent = panel.querySelector("h2")?.textContent || "";
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
    container.querySelectorAll(".preset-panel[data-type='preset'] picture").forEach((p) => {
      p.classList.add("loading");
      initImageLoader(p);
    });
    container.querySelectorAll(".preset-panel[data-type='palette']").forEach((panel) => {
      const data = itemDetails[panel.dataset.preset];
      if (data) applyPaletteVars(panel, data, mode);
    });
    if (lightbox?.matches(":popover-open")) lightboxImg.src = pickImageSrc(lightboxImg);
  });

  // Init
  const manifest = await fetchJSON("preset.json");
  if (!manifest) return;

  items = await Promise.all(
    Object.entries(manifest).map(async ([id, meta]) => {
      const isPalette = meta.type === "palette";
      const details = (await fetchJSON(`preset/${id}.json`)) || {};
      itemDetails[id] = details;
      return {
        id,
        type: meta.type || "preset",
        name: meta.name,
        author: meta.author || "Unknown",
        authorUrl: meta.url || null,
        description: meta.description || "No description available.",
        colors: isPalette ? details.colors || [] : null,
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
  render();
});
