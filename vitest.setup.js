import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { vi } from "vitest";

// Mock do localStorage para todos os testes
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock do navigator.onLine para testes de conectividade
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

// Limpar localStorage e IndexedDB antes de cada teste
beforeEach(() => {
  localStorage.clear();
  
  // Limpar IndexedDB
  const dbs = indexedDB.databases ? indexedDB.databases() : [];
  if (dbs && typeof dbs.then === "function") {
    dbs.then((databases) => {
      databases.forEach((db) => {
        indexedDB.deleteDatabase(db.name);
      });
    });
  }
});
