// -*- coding: utf-8 -*-
// 🚀 Matsnawi Digital — ESModule 7 Version (Final Stable, rollback safe)

import { buildSidebar } from "./sidebar.js";
import { loadSubbab, restoreLastOpenedSubbab } from "./subbab.js";
import { showToast } from "./toast.js";
import { renderBookmarkList, toggleBookmarkPanel, closeBookmarkPanel } from "./bookmark.js";
import { toggleTranslation } from "./utils.js";
import "./search.js";

// ================================
// 🌐 Referensi Elemen DOM
// ================================
const themeToggle = document.getElementById("themeToggle");
const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkOverlay = document.getElementById("bookmark-overlay");
const toggleLangBtn = document.getElementById("toggleLangBtn");
const searchBtn = document.getElementById("searchBtn");
const searchOverlay = document.getElementById("searchOverlay");

// ================================
// 🚀 Inisialisasi Aplikasi
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🕓 Memulai Matsnawi Digital...");

  // === Bangun Sidebar ===
  await buildSidebar();

  // === Pulihkan posisi terakhir dibaca (jika ada) ===
  const restored = await restoreLastOpenedSubbab();

  // === Jika tidak ada riwayat, muat file pertama dari index.json ===
  if (!restored) {
    try {
      const res = await fetch("./assets/data/index.json");
      const index = await res.json();
      const firstFile = index.files?.[0]?.subbabs?.[0];
      if (firstFile && firstFile.file) {
        await loadSubbab(firstFile.file, index.files[0].bab, 0, firstFile.title);
        showToast("📕 Mulai dari awal bab");
      }
    } catch (err) {
      console.error("❌ Gagal memuat index.json:", err);
    }
  }

  // === Tombol Ubah Bahasa ===
  if (toggleLangBtn) {
    // Pulihkan preferensi bahasa terakhir dari localStorage
    const savedLang = localStorage.getItem("showTranslation");
    if (savedLang === "true") {
      // Aktifkan mode Inggris sejak awal (tanpa klik)
      toggleTranslation();
    }

    // Pasang listener klik
    toggleLangBtn.addEventListener("click", toggleTranslation);
  }

  // === Toggle Tema ===
  themeToggle?.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    const useTag = themeToggle.querySelector("use");

    if (useTag) {
      useTag.setAttribute("href", isLight ? "#icon-sun" : "#icon-moon");
    }

    showToast(isLight ? "🌞 Mode Terang aktif" : "🌙 Mode Gelap aktif");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  // === Sistem Bookmark ===
  bookmarkToggle?.addEventListener("click", toggleBookmarkPanel);
  bookmarkOverlay?.addEventListener("click", closeBookmarkPanel);
  renderBookmarkList();

  // === Overlay Pencarian ===
  searchBtn?.addEventListener("click", () => {
    searchOverlay.classList.add("show");
  });
  document.getElementById("closeSearch")?.addEventListener("click", () => {
    searchOverlay.classList.remove("show");
  });

  console.log("✅ Matsnawi Digital Modular aktif (Bahasa + Bookmark + Tema + Deskripsi + Edit + Lanjutkan)");
});