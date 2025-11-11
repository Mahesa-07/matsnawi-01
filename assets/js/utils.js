// -*- coding: utf-8 -*-
// 🧭 utils.js — Fungsi Pendukung Matsnawi Digital (Final Integration)

import { showToast } from "./toast.js";

// ============================
// 🌐 Global State Getter/Setter
// ============================
let globals = {
  currentBab: null,
  currentSubbab: null,
  cacheSubbabs: {},
  baits: [],
  baitOffset: 0,
  showTranslation: false,
};

export function getGlobals() {
  return globals;
}

export function setGlobals(updates) {
  globals = { ...globals, ...updates };
}

export function getShowTranslation() {
  return globals.showTranslation;
}

// ============================
// 🈯 Bahasa / Terjemahan
// ============================
export function toggleTranslation() {
  globals.showTranslation = !globals.showTranslation;

  const btn = document.getElementById("toggleLangBtn");
  if (btn) {
    btn.innerHTML = globals.showTranslation
      ?  "🇬🇧" : "🇮🇩";
  }

  // Simpan preferensi bahasa
  localStorage.setItem("showTranslation", globals.showTranslation ? "true" : "false");

  showToast(globals.showTranslation ? "🇬🇧 Mode Inggris aktif" : "🇮🇩 Mode Indonesia aktif");

  // Render ulang kalau data sudah dimuat
  const container = document.getElementById("baitContainer");
  if (container) container.dispatchEvent(new CustomEvent("rerenderBaits"));
}

// ============================
// 📦 LocalStorage Helpers
// ============================
export function saveToLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromLocal(key) {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
}

// ============================
// 📖 Alihkan fungsi restore lama
// ============================
// ❗ Sekarang `restoreLastRead()` hanya alias untuk `restoreLastOpenedSubbab()` dari subbab.js
export async function restoreLastRead(loadFn) {
  try {
    const module = await import("./subbab.js");
    if (module.restoreLastOpenedSubbab) {
      return await module.restoreLastOpenedSubbab();
    }
  } catch (err) {
    console.error("Gagal memulihkan bacaan terakhir:", err);
  }
  return false;
}

// ============================
// ✨ Utility tambahan
// ============================
export function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}