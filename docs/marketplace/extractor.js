const COLOR_STOPS = ["00", "05", "10", "20", "25", "30", "35", "40", "50", "60", "70", "100"];
const DEFAULT_PRESETS = [
  {
    id: "baseline",
    light: {
      l: [1, 0.99, 0.98, 0.97, 0.95, 0.89, 0.86, 0.84, 0.79, 0.67, 0.52, 0.36],
      c: [0.025, 0.025, 0.025, 0.03, 0.03, 0.04, 0.04, 0.04, 0.03, 0.025, 0.025, 0.025],
    },
    dark: {
      l: [0.21, 0.22, 0.23, 0.24, 0.26, 0.28, 0.33, 0.39, 0.46, 0.58, 0.74, 0.89],
      c: [0.015, 0.015, 0.0175, 0.02, 0.0225, 0.025, 0.03, 0.035, 0.03, 0.025, 0.0225, 0.02],
    },
  },
  {
    id: "material",
    light: {
      l: [0.97, 0.96, 0.96, 0.95, 0.94, 0.92, 0.9, 0.88, 0.64, 0.56, 0.48, 0.24],
      c: [0.01, 0.01, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.03, 0.03, 0.03, 0.02],
    },
    dark: {
      l: [0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.32, 0.36, 0.56, 0.64, 0.72, 0.88],
      c: [0.025, 0.025, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.05, 0.05, 0.05, 0.04],
    },
  },
  {
    id: "radiance",
    light: {
      l: [0.95, 0.94, 0.92, 0.91, 0.87, 0.85, 0.81, 0.75, 0.66, 0.59, 0.53, 0.4],
      c: [0.01, 0.02, 0.03, 0.03, 0.04, 0.04, 0.06, 0.06, 0.1, 0.1, 0.08, 0.06],
    },
    dark: {
      l: [0.27, 0.28, 0.3, 0.32, 0.35, 0.37, 0.41, 0.48, 0.57, 0.66, 0.75, 0.92],
      c: [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.04, 0.04, 0.04, 0.04],
    },
  },
  {
    id: "softlight",
    light: {
      l: [0.975, 0.965, 0.955, 0.94, 0.915, 0.89, 0.815, 0.79, 0.745, 0.69, 0.64, 0.515],
      c: [0.025, 0.025, 0.025, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.02],
    },
    dark: {
      l: [0.28, 0.29, 0.3, 0.32, 0.35, 0.39, 0.43, 0.47, 0.6, 0.66, 0.72, 0.83],
      c: [0.01, 0.01, 0.01, 0.01, 0.015, 0.015, 0.015, 0.015, 0.02, 0.02, 0.02, 0.04],
    },
  },
];

const PALETTE_PREFIX = "baseline-style@@";
const OPTIONAL_KEYS = ["text-normal", "text-muted", "text-faint", "color-red", "color-orange", "color-yellow", "color-green", "color-cyan", "color-blue", "color-purple", "color-pink"];

function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(normalized)) return null;

  let r;
  let g;
  let b;

  if (normalized.length === 3 || normalized.length === 4) {
    r = normalized[0] + normalized[0];
    g = normalized[1] + normalized[1];
    b = normalized[2] + normalized[2];
  } else {
    r = normalized.slice(0, 2);
    g = normalized.slice(2, 4);
    b = normalized.slice(4, 6);
  }

  return {
    r: parseInt(r, 16) / 255,
    g: parseInt(g, 16) / 255,
    b: parseInt(b, 16) / 255,
  };
}

function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab(rgb) {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function hexToOklch(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const oklab = rgbToOklab(rgb);
  const c = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
  const h = ((Math.atan2(oklab.b, oklab.a) * 180) / Math.PI + 360) % 360;

  return {
    l: oklab.l,
    c,
    h,
  };
}

function findBestScale(oklchColors, getTarget, getRecon, min, max, step) {
  let bestScale = 1;
  let minError = Infinity;

  for (let scale = min; scale <= max; scale += step) {
    let error = 0;
    let count = 0;
    for (let i = 0; i < oklchColors.length; i++) {
      if (oklchColors[i]) {
        error += (getTarget(i) - getRecon(i, scale)) ** 2;
        count++;
      }
    }
    if (count > 0 && error < minError) {
      minError = error;
      bestScale = scale;
    }
  }

  return bestScale;
}

function getHueScale(oklchColors) {
  let hueX = 0;
  let hueY = 0;
  let weightSum = 0;

  for (const color of oklchColors) {
    if (color?.c > 0.005) {
      const hRad = (color.h * Math.PI) / 180;
      const weight = color.c;
      hueX += Math.cos(hRad) * weight;
      hueY += Math.sin(hRad) * weight;
      weightSum += weight;
    }
  }

  if (weightSum === 0) return 180;
  const avgH = (Math.atan2(hueY, hueX) * 180) / Math.PI;
  return ((avgH < 0 ? avgH + 360 : avgH) + 360) % 360;
}

function matchPreset(hexStops, mode) {
  const oklchColors = hexStops.map((hex) => (hex ? hexToOklch(hex) : null));
  const hScale = getHueScale(oklchColors);

  let best = null;

  for (const preset of DEFAULT_PRESETS) {
    const presetData = preset[mode];
    if (!presetData) continue;

    const lScale = findBestScale(
      oklchColors,
      (i) => oklchColors[i].l,
      (i, scale) => (mode === "dark" ? presetData.l[i] ** (1 / scale) : presetData.l[i] ** scale),
      0.5,
      1.5,
      0.01,
    );

    const cScale = findBestScale(
      oklchColors,
      (i) => oklchColors[i].c,
      (i, scale) => Math.min(0.1, presetData.c[i] * scale),
      0,
      2,
      0.01,
    );

    let error = 0;
    for (let i = 0; i < oklchColors.length; i++) {
      if (oklchColors[i]) {
        const reconL = mode === "dark" ? presetData.l[i] ** (1 / lScale) : presetData.l[i] ** lScale;
        const reconC = Math.min(0.1, presetData.c[i] * cScale);
        error += (oklchColors[i].l - reconL) ** 2 + (oklchColors[i].c - reconC) ** 2;
      }
    }

    if (!best || error < best.error) {
      best = {
        id: preset.id,
        lScale,
        cScale,
        hScale,
        error,
      };
    }
  }

  return best;
}

function paletteKey(key, mode) {
  return `${PALETTE_PREFIX}${key}@@${mode}`;
}

function getPaletteValue(data, key, mode) {
  if (!data) return null;
  return data[paletteKey(key, mode)] ?? null;
}

function hasStaticMode(data, mode) {
  if (!data) return false;
  return Object.keys(data).some((key) => key.endsWith(`@@${mode}`));
}

function hasDynamicMode(data, mode) {
  const primary = getPaletteValue(data, "background-primary", mode);
  const secondary = getPaletteValue(data, "background-secondary", mode);
  return !!(hexToOklch(primary) && hexToOklch(secondary));
}

function getContrastDecision(primaryHex, secondaryHex, mode) {
  const primary = hexToOklch(primaryHex);
  const secondary = hexToOklch(secondaryHex);
  if (!primary || !secondary) {
    return {
      contrast: `contrast-${mode}`,
      shouldInverse: false,
    };
  }

  const delta = secondary.l - primary.l;
  if (Math.abs(delta) < 0.01) {
    return {
      contrast: `contrast-${mode}-tonal`,
      shouldInverse: false,
    };
  }

  const shouldInverse = mode === "light" ? delta > 0 : delta < 0;
  return {
    contrast: shouldInverse ? `contrast-${mode}-inverse` : `contrast-${mode}`,
    shouldInverse,
  };
}

function extractDynamicPalette(data, mode) {
  if (!hasDynamicMode(data, mode)) return null;

  const primary = getPaletteValue(data, "background-primary", mode);
  const secondary = getPaletteValue(data, "background-secondary", mode);
  const decision = getContrastDecision(primary, secondary, mode);
  const scalePrimary = decision.shouldInverse ? secondary : primary;
  const scaleSecondary = decision.shouldInverse ? primary : secondary;
  const stops = COLOR_STOPS.map((stop) => {
    if (stop === "00") return scalePrimary;
    if (stop === "20") return scaleSecondary;
    return null;
  });

  const best = matchPreset(stops, mode);
  if (!best) return null;

  const output = {
    [`${PALETTE_PREFIX}color-scheme-${mode}`]: `${best.id}-${mode}`,
    [`${PALETTE_PREFIX}background-contrast-${mode}`]: decision.contrast,
    [`${PALETTE_PREFIX}colorist-l-${mode}`]: Number(best.lScale.toFixed(3)),
    [`${PALETTE_PREFIX}colorist-c-${mode}`]: Number(best.cScale.toFixed(3)),
    [`${PALETTE_PREFIX}colorist-h-${mode}`]: Number(best.hScale.toFixed(1)),
  };

  OPTIONAL_KEYS.forEach((key) => {
    const value = getPaletteValue(data, key, mode);
    if (value != null) output[paletteKey(key, mode)] = value;
  });

  return output;
}

function extractStaticPalette(data, mode) {
  if (!hasStaticMode(data, mode)) return null;

  const output = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith(`@@${mode}`)) output[key] = value;
  }

  return Object.keys(output).length ? output : null;
}

window.BaselinePaletteExtractor = {
  extractDynamicPalette,
  extractStaticPalette,
  hasDynamicMode,
  hasStaticMode,
};
