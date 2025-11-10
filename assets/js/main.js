// -*- coding: utf-8 -*-
// 🚀 Matsnawi Digital — ESModule 6 Version

import { buildSidebar } from "./sidebar.js";
import { loadSubbab } from "./subbab.js";
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

// ================================
// 🚀 Init App
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🕓 Memulai Matsnawi Digital...");

  // === Bangun Sidebar ===
  await buildSidebar();

  // === Muat file pertama dari index.json ===
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    const firstFile = index.files?.[0]?.subbabs?.[0];
    if (firstFile && firstFile.file) {
      await loadSubbab(firstFile.file, index.files[0].bab, 0, firstFile.title);
    }
  } catch (err) {
    console.error("❌ Gagal memuat index.json:", err);
  }

  // === Tombol Ubah Bahasa ===
  toggleLangBtn?.addEventListener("click", toggleTranslation);

  // === Toggle Tema ===
  themeToggle?.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");

  // Ambil elemen <use> di dalam tombol themeToggle
  const useTag = themeToggle.querySelector("use");

  // Ganti ikon SVG sesuai mode (aman jika <use> belum ada)
  if (useTag) {
    useTag.setAttribute("href", isLight ? "#icon-sun" : "#icon-moon");
  }

  // Tampilkan notifikasi toast
  showToast(isLight ? "🌞 Mode Terang aktif" : "🌙 Mode Gelap aktif");

  // Simpan preferensi pengguna (opsional)
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

  // === Sistem Bookmark ===
  bookmarkToggle?.addEventListener("click", toggleBookmarkPanel);
  bookmarkOverlay?.addEventListener("click", closeBookmarkPanel);
  renderBookmarkList();

  console.log("✅ Matsnawi Digital Modular aktif (Bahasa + Bookmark + Tema + Deskripsi + Edit)");
});