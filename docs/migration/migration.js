(() => {
  const $ = (s) => document.querySelector(s);
  const prefsInput = $(".prefs-input");
  const prefsOutput = $(".prefs-output");
  const copyBtn = $(".copy-btn");
  const downloadBtn = $(".download-btn");
  const warningDiv = $(".warning-container");
  const conflictDiv = $(".conflict-container");
  const unsupportedDiv = $(".unsupported-container");

  const jsonCache = new Map();
  const fetchOnce = async (url) => {
    if (!jsonCache.has(url)) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      jsonCache.set(url, await res.json());
    }
    return jsonCache.get(url);
  };
  const getMapping = () => fetchOnce("mapping.json");
  const getLabels = () => fetchOnce("mapping-baseline.json").catch(() => ({}));

  const stripMode = (s) => s.replace(/@@(light|dark)$/i, "");
  const isHex6 = (v) => typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v);
  const isColor = (v) => typeof v === "string" && /^(#[0-9A-Fa-f]{3,8}|rgba?\s*\(|hsla?\s*\()/.test(v);
  const groupBy = (arr, fn) => arr.reduce((m, x) => ((m[fn(x)] ??= []).push(x), m), {});

  // Core migration logic
  const migratePrefs = (mapping, oldPrefs) => {
    const newPrefs = {},
      unsupported = [],
      conflicts = {},
      themeBases = {};
    for (const t in mapping) if (mapping[t]?.__name) themeBases[t] = mapping[t].__name;

    for (const k in oldPrefs) {
      if (!Object.hasOwnProperty.call(oldPrefs, k)) continue;
      const seg = k.split("@@");
      if (seg.length < 2) continue;
      const themeKey = Object.keys(themeBases).find((t) => seg[0].startsWith(t));
      if (!themeKey) continue;
      const [, oldId, ...extra] = seg;
      const val = oldPrefs[k];
      const rules = [mapping[themeKey][oldId]].flat().filter(Boolean);

      if (!rules.length) {
        const nk = ["baseline-style", oldId, ...extra].join("@@");
        newPrefs[nk] !== undefined ? (conflicts[nk] ??= [newPrefs[nk]]).push(val) : (newPrefs[nk] = val);
        continue;
      }

      for (const rule of rules) {
        if (rule.unsupported) {
          unsupported.push({ name: rule.name || `Key '${oldId}'`, category: rule.category || "General", theme: themeKey });
          continue;
        }
        let newVal = val,
          newKey = rule.newId || oldId;
        if (rule.valueMapping) {
          const vr = rule.valueMapping[val];
          if (vr === undefined) {
            if (rule.valueMapping.__fallback !== undefined) newVal = rule.valueMapping.__fallback;
            else {
              unsupported.push({ name: `Value '${val}' for '${oldId}'`, category: rule.category || "Unsupported Options", theme: themeKey });
              continue;
            }
          } else if (vr?.unsupported) {
            unsupported.push({ name: vr.name || `Option '${val}'`, category: vr.category || "General", theme: themeKey });
            continue;
          } else newVal = vr;
        }
        const assign = (nk) => {
          const final = ["baseline-style", nk, ...extra].join("@@");
          newPrefs[final] !== undefined ? (conflicts[final] ??= [newPrefs[final]]).push(newVal) : (newPrefs[final] = newVal);
        };
        Array.isArray(newKey) ? newKey.forEach(assign) : assign(newKey);
      }
    }

    for (const k in conflicts) {
      const vals = conflicts[k];
      if (vals.every((v) => v === vals[0])) {
        newPrefs[k] = vals[0];
        delete conflicts[k];
      } else conflicts[k] = [...new Set(vals)];
    }
    return { newPrefs, unsupported, themeBases, conflicts };
  };

  // Rendering
  const renderWarnings = async (prefs) => {
    const labels = await getLabels();
    const keys = Object.keys(prefs).filter((k) => typeof prefs[k] === "string" && /\d/.test(prefs[k]) && !isColor(prefs[k]));
    warningDiv.innerHTML = keys.length ? `<h1>Note</h1><div class="warning-content"><div class="warning-description">Following settings might not work correctly, please double check after importing.</div><ul class="warning-list">${keys.map((k) => `<li class="warning-item">${labels[stripMode(k.replace(/^baseline-style@@/, ""))] || stripMode(k)}</li>`).join("")}</ul></div>` : "";
  };

  let conflictListenerSetup = false;
  const renderConflicts = async (conflicts, prefs) => {
    const labels = await getLabels();
    if (!Object.keys(conflicts).length) {
      conflictDiv.innerHTML = "";
      return;
    }
    conflictDiv.innerHTML =
      `<h1>Conflicts</h1>` +
      Object.entries(conflicts)
        .map(([key, vals]) => {
          const stripped = key.replace(/^baseline-style@@/, "");
          const themeType = stripped.includes("@@light") ? "Light Theme" : stripped.includes("@@dark") ? "Dark Theme" : "";
          return `<div class="conflict-item"><div class="conflict-key">${labels[stripMode(stripped)] || stripMode(stripped)}</div>` + (themeType ? `<div class="conflict-theme">${themeType}</div>` : "") + `<div class="conflict-actions">${vals.map((val, i) => `<button data-conflict-key="${key}" data-conflict-value="${val}" class="conflict-label${i === 0 ? " is-active" : ""}">` + (labels[val] || val) + (isHex6(val) ? `<span class="color-preview" style="background-color:${val}"></span>` : "") + `</button>`).join("")}</div></div>`;
        })
        .join("");

    if (!conflictListenerSetup) {
      conflictDiv.addEventListener("click", (e) => {
        const label = e.target.closest(".conflict-label");
        if (!label || !conflictDiv.contains(label)) return;
        conflictDiv.querySelectorAll(`[data-conflict-key='${label.dataset.conflictKey}']`).forEach((l) => l.classList.remove("is-active"));
        label.classList.add("is-active");
        const active = { ...prefs };
        conflictDiv.querySelectorAll(".conflict-label.is-active").forEach((sel) => {
          let v = sel.dataset.conflictValue;
          if (v === "true") v = true;
          else if (v === "false") v = false;
          active[sel.dataset.conflictKey] = v;
        });
        updateOutput(active);
      });
      conflictListenerSetup = true;
    }
  };

  const renderUnsupported = (unsupported, themeBases) => {
    if (!unsupported.length) {
      unsupportedDiv.innerHTML = "";
      return;
    }
    const byTheme = groupBy(unsupported, (i) => i.theme || "unknown");
    const themeEntries = Object.entries(byTheme);
    unsupportedDiv.innerHTML =
      `<h1>Unsupported style settings</h1>` +
      themeEntries
        .map(([theme, items], themeIndex) => {
          const byCat = groupBy(items, (i) => i.category || "General");
          return (
            `<div class="unsupported-theme"><div class="unsupported-theme-name">${themeBases?.[theme] || theme}</div>` +
            Object.entries(byCat)
              .map(([cat, catItems]) => {
                const seen = new Set();
                return (
                  `<div class="unsupported-category"><div class="unsupported-category-name">${cat}</div><ul class="unsupported-list">` +
                  catItems
                    .filter(({ name }) => {
                      const s = stripMode(name);
                      return !seen.has(s) && seen.add(s);
                    })
                    .map(({ name }) => `<li class="unsupported-item">${name}</li>`)
                    .join("") +
                  `</ul></div>`
                );
              })
              .join("") +
            `</div>`
          );
        })
        .join("<hr>");
  };

  const updateOutput = (prefs) => {
    const str = Object.keys(prefs).length ? JSON.stringify(prefs, null, 2) : "";
    prefsOutput.value = str;
    downloadBtn.href = "data:text/json;charset=utf-8," + encodeURIComponent(str);
  };

  const showResults = async (prefs, unsupported, themeBases, conflicts) => {
    updateOutput(prefs);
    renderUnsupported(unsupported, themeBases);
    await renderWarnings(prefs);
    await renderConflicts(conflicts, prefs);
  };

  // Event handlers
  copyBtn.onclick = () =>
    navigator.clipboard.writeText(prefsOutput.value).then(() => {
      copyBtn.innerHTML = "Copied!";
      setTimeout(() => (copyBtn.innerHTML = "Copy"), 1000);
      if (typeof gtag === "function") gtag("event", "migration_copy");
    });

  downloadBtn.onclick = () => {
    if (typeof gtag === "function") gtag("event", "migration_download");
  };

  $(".clear-btn").onclick = () => {
    prefsInput.value = "";
    showResults({}, [], {}, {});
  };

  let last = "";
  prefsInput.addEventListener("input", () => {
    const val = prefsInput.value;
    if (val === last) return;
    last = val;
    if (!val.trim()) return showResults({}, [], {}, {});
    getMapping()
      .then((mapping) => {
        try {
          showResults(...Object.values(migratePrefs(mapping, JSON.parse(val))));
        } catch (e) {
          showResults({}, [], {}, {});
          prefsOutput.value = `Error parsing preferences: ${e.message}`;
        }
      })
      .catch((e) => {
        showResults({}, [], {}, {});
        prefsOutput.value = `Error loading mapping file: ${e.message || e}`;
      });
  });

  showResults({}, [], {}, {});
})();
