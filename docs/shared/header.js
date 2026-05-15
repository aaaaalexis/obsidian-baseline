(() => {
  const scriptSrc = document.currentScript?.src || "";
  const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1);

  async function loadHeader() {
    const host = document.querySelector(".header");
    if (!host) return;

    const res = await fetch(basePath + "header.html");
    if (!res.ok) return;

    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const template = doc.getElementById("header-template");
    if (!template) return;

    const clone = template.content.cloneNode(true);
    const subtitle = host.dataset.subtitle;

    if (subtitle) {
      const headerTitle = clone.querySelector(".header-title");
      headerTitle.innerHTML = `
        <h1>
          <a href=".."><i data-lucide="chevron-left"></i>Baseline for Obsidian</a><span>/</span>
        </h1>
        <h1>${subtitle}</h1>
      `;
    }

    // Move any child elements from the host into header-actions (before default items)
    const actions = clone.querySelector(".header-actions");
    Array.from(host.children).forEach((el) => actions.insertBefore(el, actions.firstChild));

    host.appendChild(clone);

    window.lucide?.createIcons?.();

    // appearance.js is deferred — if this fetch resolved before it ran, Appearance
    // won't exist yet. DOMContentLoaded fires after all deferred scripts, so use
    // it as a fallback.
    if (window.Appearance) window.Appearance.bindSwitcher();
    else document.addEventListener("DOMContentLoaded", () => window.Appearance?.bindSwitcher?.(), { once: true });
  }

  loadHeader();
})();
