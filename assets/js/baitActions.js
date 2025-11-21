// -*- coding: utf-8 -*-
// 🎯 baitActions.js — Bookmark, Edit, Deskripsi, Bahasa (Final)

// ==========================
// MODULE IMPORT
// ==========================
import { showToast } from "./toast.js";
import { openEditPanel } from "./editPanel.js";
import { toggleBookmark } from "./bookmark.js";

// ==========================
// 🔹 Ambil bookmark
// ==========================
function loadBookmarks() {
  return JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
}

// ==========================
// 🔹 Bahasa per-bait + animasi
// ==========================
function setupLanguageToggle(bait) {
  const indoEl = bait.querySelector(".bait-indo");
  const engEl = bait.querySelector(".bait-inggris");
  const langBtn = bait.querySelector(".btn-lang");

  if (!indoEl || !engEl || !langBtn) return;

  let showEnglish = false;

  langBtn.addEventListener("click", () => {
    const showEl = showEnglish ? indoEl : engEl;
    const hideEl = showEnglish ? engEl : indoEl;

    hideEl.classList.add("fade-out");

    setTimeout(() => {
      hideEl.classList.add("hidden");
      hideEl.classList.remove("fade-out");

      showEl.classList.remove("hidden");
      showEl.classList.add("fade-in");

      setTimeout(() => showEl.classList.remove("fade-in"), 250);

      showEnglish = !showEnglish;
      langBtn.textContent = showEnglish ? "🇮🇩" : "🇬🇧";
    }, 250);
  });
}

// ==========================
// 🔹 Pasang Listener Utama
// ==========================
export function addBaitListeners() {
  const bookmarks = loadBookmarks();

  // ― Reset listener (clone)
  document.querySelectorAll(".bait").forEach((bait) => {
    const clone = bait.cloneNode(true);
    bait.replaceWith(clone);
  });

  document.querySelectorAll(".bait").forEach((bait) => {
    const baitId = Number(bait.dataset.id);

    const btnBookmark = bait.querySelector(".btn-bookmark");
    const btnEdit = bait.querySelector(".btn-edit");
    const btnDesc = bait.querySelector(".btn-desc");

    // ------- Bookmark Status Awal -------
    updateBookmarkIcon(btnBookmark, bookmarks.includes(baitId));

    // ------- Tombol Edit -------
    btnEdit?.addEventListener("click", () => {
      const indoText = bait.querySelector(".bait-indo")?.textContent.trim() || "";
      openEditPanel(baitId, indoText);
    });

    // ------- Tombol Deskripsi -------
    btnDesc?.addEventListener("click", () => {
      bait.querySelector(".bait-desc")?.classList.toggle("hidden");
    });

    // ------- Tombol Bookmark -------
    btnBookmark?.addEventListener("click", (e) => {
      e.stopPropagation();
      const active = toggleBookmark(baitId);  
      updateBookmarkIcon(btnBookmark, active);
    });

    // ------- Tombol Bahasa (per bait) -------
    setupLanguageToggle(bait);
  });
}

// ==========================
// 🔹 Update Ikon Bookmark
// ==========================
function updateBookmarkIcon(button, active) {
  if (!button) return;

  button.classList.toggle("active", active);

  button.innerHTML = active
    ? `<svg width="20" height="20"><use href="#icon-bookmark-filled"></use></svg>`
    : `<svg width="20" height="20"><use href="#icon-bookmark"></use></svg>`;
}

// ==========================
// 🔹 Scroll ke bait tertentu
// ==========================
export function scrollToBait(id) {
  const baitElement =
    document.querySelector(`.bait[data-bait-index="${id}"]`) ||
    document.querySelector(`.bait[data-id="${id}"]`);

  if (!baitElement) {
    showToast(`❌ Bait ${id} tidak ditemukan.`);
    return;
  }

  baitElement.scrollIntoView({ behavior: "smooth", block: "center" });
  baitElement.classList.add("highlight-bait");

  setTimeout(() => baitElement.classList.remove("highlight-bait"), 1400);
}