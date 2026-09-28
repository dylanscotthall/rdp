export const THEME_KEY = "theme";

// Runs in <head> before first paint so the page never flashes the light
// theme while waiting for React. Dark is the default; only an explicit
// "light" choice turns it off.
export const themeInitScript = `
try {
  if (localStorage.getItem("${THEME_KEY}") !== "light") {
    document.documentElement.classList.add("dark");
  }
} catch (e) {
  document.documentElement.classList.add("dark");
}
`;
