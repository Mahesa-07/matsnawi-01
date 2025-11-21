// -*- coding: utf-8 -*-
// 🚀 Matsnawi Digital — ESModule 6 Version (Tanpa Gesture Swipe + Highlight Bait)

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
    const useTag = themeToggle.querySelector("use");
    if (useTag) useTag.setAttribute("href", isLight ? "#icon-sun" : "#icon-moon");
    showToast(isLight ? "🌞 Mode Terang aktif" : "🌙 Mode Gelap aktif");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  // === Sistem Bookmark ===
  bookmarkToggle?.addEventListener("click", toggleBookmarkPanel);
  bookmarkOverlay?.addEventListener("click", closeBookmarkPanel);
  renderBookmarkList();

  // === Efek sorot bait dari sidebar ===
  sidebarHighlightHandler();

  // === Tampilkan Toast Info Pertama Kali ===
  showFirstTimeHint();

  console.log("✅ Matsnawi Digital Modular aktif (Tanpa Gesture Swipe)");
});

// ================================
// 🪶 Toast Info Pertama Kali
// ================================
function showFirstTimeHint() {
  const hasShown = localStorage.getItem("shownSwipeHint");
  if (!hasShown) {
    showToast("📖 Selamat datang di Matsnawi Digital", 2500);
    localStorage.setItem("shownSwipeHint", "true");
  }
}

// ================================
// ✨ Efek sorot bait saat klik bait di sidebar
// ================================
function sidebarHighlightHandler() {
  document.addEventListener("click", (e) => {
    const baitItem = e.target.closest(".bait-item");
    if (!baitItem) return;

    const targetId = baitItem.dataset.target; // contoh: "bait-12"
    const targetBait = document.getElementById(targetId);

    if (targetBait) {
      // Scroll lembut ke posisi bait di konten
      targetBait.scrollIntoView({ behavior: "smooth", block: "center" });

      // Hapus highlight sebelumnya (jika ada)
      document.querySelectorAll(".bait.highlighted").forEach((b) =>
        b.classList.remove("highlighted")
      );

      // Tambahkan highlight ke bait yang diklik
      targetBait.classList.add("highlighted");

      // Hilangkan efek highlight setelah 2.2 detik
      setTimeout(() => {
        targetBait.classList.remove("highlighted");
      }, 2200);
    }
  });
}