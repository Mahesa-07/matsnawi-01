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
const sidebar = document.getElementById("sidebar");

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

  // === Gestur Swipe untuk Sidebar ===
  initSidebarSwipe();

  // === Tampilkan Toast Info Pertama Kali ===
  showFirstTimeHint();

  console.log("✅ Matsnawi Digital Modular aktif (Bahasa + Bookmark + Tema + Swipe)");
});

// ================================
// 📱 Swipe Gesture Sidebar
// ================================
function initSidebarSwipe() {
  if (!sidebar) return;

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 80; // minimal jarak geser (px)
  const EDGE_ZONE = 40; // area tepi layar aktif

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    isSwiping = startX < EDGE_ZONE || sidebar.classList.contains("open");
  });

  document.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    currentX = e.touches[0].clientX;

    if (!sidebar.classList.contains("open") && startX < EDGE_ZONE && currentX - startX > 0) {
      const translate = Math.min(currentX - startX, sidebar.offsetWidth);
      sidebar.style.transform = `translateX(${translate - sidebar.offsetWidth}px)`;
    }

    if (sidebar.classList.contains("open") && currentX - startX < 0) {
      const translate = Math.max(currentX - startX, -sidebar.offsetWidth);
      sidebar.style.transform = `translateX(${translate}px)`;
    }
  });

  document.addEventListener("touchend", () => {
    if (!isSwiping) return;
    const diff = currentX - startX;
    sidebar.style.transition = "transform 0.3s ease";

    if (!sidebar.classList.contains("open") && diff > SWIPE_THRESHOLD) {
      sidebar.classList.add("open");
      sidebar.style.transform = "translateX(0)";
    } else if (sidebar.classList.contains("open") && diff < -SWIPE_THRESHOLD) {
      sidebar.classList.remove("open");
      sidebar.style.transform = `translateX(-${sidebar.offsetWidth}px)`;
    } else {
      sidebar.style.transform = sidebar.classList.contains("open")
        ? "translateX(0)"
        : `translateX(-${sidebar.offsetWidth}px)`;
    }

    setTimeout(() => (sidebar.style.transition = ""), 300);
    isSwiping = false;
  });
}

// ================================
// 🪶 Toast Info Pertama Kali
// ================================
function showFirstTimeHint() {
  const hasShown = localStorage.getItem("shownSwipeHint");
  if (!hasShown) {
    showToast("👉 Geser ke kanan untuk membuka sidebar", 3000);
    localStorage.setItem("shownSwipeHint", "true");
  }
}