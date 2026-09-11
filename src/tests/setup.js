import "@testing-library/jest-dom";

// Polyfill localStorage for test runner if needed
if (typeof window !== "undefined" && !window.localStorage) {
  const store = {};
  window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((key) => delete store[key]); },
  };
}
