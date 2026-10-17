/**
 * Theme preference is a per-device display setting that must be readable
 * synchronously before first paint, so it lives in localStorage rather than
 * IndexedDB.
 */
export const THEME_STORAGE_KEY = 'matched:theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Runs in <head> before paint to set data-theme and avoid a flash. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('${DARK_QUERY}').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;
