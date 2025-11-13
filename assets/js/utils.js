// -*- coding: utf-8 -*-
// 🌿 Utils & Global Variables — ESModule 6 (Final Stable for Language Toggle)

import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";

// ============================
// 🔹 Global State Object
// ============================
const globals = {
  currentBab: null,
  currentSubbab: null,
  cacheSubbabs: {},
  baits: [],
  showTranslation: false, // 🟢 default: tampil Bahasa Indonesia saja
  baitOffset: 0,
  editingBait: null,
  pendingRemoveId: null,
};

// ============================
// 🔹 Proxy agar properti bisa diakses langsung
// ============================
const proxy = new Proxy(globals, {
  get(target, prop) {
    if (prop in target) return target[prop];
    console.warn(`⚠️ Akses ke properti tak dikenal di globals: "${prop}"`);
    return undefined;
  },
  set(target, prop, value) {
    if (prop in target) {
      target[prop] = value;
      return true;
    }
    console.warn(`⚠️ Properti global tidak dikenal: "${prop}"`);
    return false;
  },
});

// ============================
// 🔹 Getter & Setter Helper
// ============================
export function setGlobals(vars = {}) {
  Object.entries(vars).forEach(([key, val]) => {
    if (key in proxy) proxy[key] = val;
    else console.warn(`⚠️ Kunci global tidak dikenali: "${key}"`);
  });
}

export function getGlobals() {
  return { ...globals };
}

export function getShowTranslation() {
  return proxy.showTranslation;
}

// ============================
// 🔹 Toggle Bahasa (Indonesia ↔ Inggris)
// ============================
export function toggleTranslation() {
  proxy.showTranslation = !proxy.showTranslation;

  const btn = document.getElementById("toggleLangBtn");
  if (!btn) return;

  const label = btn.querySelector("span");
  const icon = btn.querySelector("use");

  // Ubah teks label
  if (label) {
    label.textContent = proxy.showTranslation ? "Inggris" : "Indonesia";
  }

  // Ubah ikon SVG
  if (icon) {
    icon.setAttribute(
      "href",
      proxy.showTranslation ? "#icon-translate" : "#icon-language"
    );
  }

  // Render ulang dan beri notifikasi
  const { baits, baitOffset } = getGlobals();
  if (baits && baits.length) {
    renderBaits(baits, baitOffset);
    showToast(proxy.showTranslation ? "Bahasa 🇬🇧 Aktif" : "Bahasa 🇮🇩 Aktif");
  } else {
    showToast("⚠️ Tidak ada bait untuk diperbarui.");
  }

  console.log(`🌐 Bahasa sekarang: ${proxy.showTranslation ? "English" : "Indonesia"}`);
}

// ============================
// 🔹 Ekspor langsung (opsional)
// ============================
export const currentBab = proxy.currentBab;
export const currentSubbab = proxy.currentSubbab;
export const cacheSubbabs = proxy.cacheSubbabs;
export const baits = proxy.baits;
export const baitOffset = proxy.baitOffset;
export const editingBait = proxy.editingBait;
export const pendingRemoveId = proxy.pendingRemoveId;

// ============================
// 🔹 Utility Function: Escape HTML
// ============================
export function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ============================
// ✨ Escape HTML Aman (biarkan tag dasar)
// ============================
// Mengizinkan hanya tag HTML dasar: <b>, <i>, <u>, <em>, <span>, <p>, <br>, <blockquote>
// Tag lain seperti <script>, <img>, <iframe>, <svg>, dll dihapus otomatis
export function escapeHtmlSafe(str = "") {
  if (!str) return "";
  return str
    // hapus semua tag yang bukan termasuk daftar putih
    .replace(/<(?!\/?(b|i|u|em|span|p|br|blockquote)\b)[^>]*>/gi, "")
    // hapus atribut berbahaya seperti onclick, onerror, dsb.
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}
// ============================
// 🔹 Utility: Sanitize HTML dasar (izinkan tag aman)
// ============================
export function sanitizeHtml(s) {
  if (!s) return "";

  // Hapus tag berbahaya
  return s
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "") // cegah event handler berbahaya (onclick, dll)
    .replace(/javascript:/gi, "");  // cegah URL javascript
}