/**
 * Theme preference is a per-device display setting that must be readable
 * synchronously before first paint, so it lives in localStorage rather than
 * IndexedDB.
 */
export const THEME_STORAGE_KEY = 'matched:theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';
/** Set once a profile exists, so returning visitors see the app at first paint. */
export const ONBOARDED_KEY = 'matched:onboarded';

/** Runs in <head> before paint: sets data-theme, and data-onboarded for returning visitors. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('${DARK_QUERY}').matches);document.documentElement.dataset.theme=d?'dark':'light';if(localStorage.getItem('${ONBOARDED_KEY}'))document.documentElement.dataset.onboarded='';}catch(e){document.documentElement.dataset.theme='light';}})();`;
