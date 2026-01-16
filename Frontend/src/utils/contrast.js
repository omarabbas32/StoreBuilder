/**
 * Utility for calculating color contrast according to WCAG 2.1
 */

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Helper for relative luminance calculation
const getRelativeLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two hex colors
 * @returns number (1 to 21)
 */
export const getContrastRatio = (hex1, hex2) => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Returns WCAG level based on ratio
 * @returns { aa: boolean, aaa: boolean }
 */
export const getWCAGLevel = (ratio) => {
    return {
        aa: ratio >= 4.5,
        aaa: ratio >= 7
    };
};

// Helper: RGB to HSL
const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
};

// Helper: HSL to Hex
const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

export const getHarmonySteps = (hex, mode = 'analogous') => {
    const rgb = hexToRgb(hex);
    if (!rgb) return [];
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    switch (mode) {
        case 'complementary':
            return [hex, hslToHex((h + 180) % 360, s, l)];
        case 'analogous':
            return [
                hslToHex((h + 330) % 360, s, l),
                hex,
                hslToHex((h + 30) % 360, s, l)
            ];
        case 'triadic':
            return [
                hex,
                hslToHex((h + 120) % 360, s, l),
                hslToHex((h + 240) % 360, s, l)
            ];
        case 'monochromatic':
            return [
                hslToHex(h, s, Math.max(0, l - 30)),
                hslToHex(h, s, Math.max(0, l - 15)),
                hex,
                hslToHex(h, s, Math.min(100, l + 15)),
                hslToHex(h, s, Math.min(100, l + 30))
            ];
        default:
            return [hex];
    }
};

/**
 * Checks if color is dark or light
 */
export const isDark = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return false;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance < 0.5;
};
