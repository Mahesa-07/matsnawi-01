// -*- coding: utf-8 -*-
// 🔖 bookmark.js — Bookmark Management (ESModule Final Stable)

import { showToast } from "./toast.js";
import { scrollToBait } from "./baitActions.js";

let pendingRemoveId = null;

// =============================
// 🔹 Elemen DOM
// =============================
const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkPanel = document.getElementById("bookmark-panel");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkOverlay = document.getElementById("bookmark-overlay");
const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

// =============================
// 🔹 Toggle Panel Bookmark
// =============================
export function toggleBookmarkPanel() {
  const isOpen = bookmarkPanel.classList.contains("show");
  isOpen ? closeBookmarkPanel() : openBookmarkPanel();
}

export function openBookmarkPanel() {
  renderBookmarkList();
  bookmarkPanel.classList.add("show");
  bookmarkOverlay.classList.add("show");
}

export function closeBookmarkPanel() {
  bookmarkPanel.classList.remove("show");
  bookmarkOverlay.classList.remove("show");
}

// =============================
// 🔹 Tambah / Hapus Bookmark
// =============================
export function toggleBookmark(id) {
  id = Number(id);
  let bookmarks = getBookmarks();

  if (bookmarks.includes(id)) {
    pendingRemoveId = id;
    openConfirmDialog();
  } else {
    bookmarks.push(id);
    saveBookmarks(bookmarks);
    showToast("🔖 Ditambahkan ke Bookmark");
    renderBookmarkList();
    updateBaitButtonState(id, true);
  }
}

// =============================
// 🔹 Render Daftar Bookmark
// =============================
export function renderBookmarkList() {
  const bookmarks = getBookmarks();

  if (!bookmarks.length) {
    bookmarkList.innerHTML = "<p>Tidak ada bookmark.</p>";
    return;
  }

  bookmarkList.innerHTML = bookmarks
    .map(
      (id) => `
      <div class="bookmark-item" data-id="${id}">
        <span>Bait ${id}</span>
        <button class="remove-bookmark" title="Hapus">✖</button>
      </div>`
    )
    .join("");

  // Tambah event listener untuk tiap item
  bookmarkList.querySelectorAll(".bookmark-item").forEach((item) => {
    const id = Number(item.dataset.id);
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-bookmark")) {
        e.stopPropagation();
        pendingRemoveId = id;
        openConfirmDialog();
        return;
      }
      scrollToBait(id);
      closeBookmarkPanel();
    });
  });
}

// =============================
// 🔹 Konfirmasi Hapus
// =============================
export function openConfirmDialog() {
  confirmDialog.setAttribute("aria-hidden", "false");
  confirmDialog.classList.add("show");
}

function closeConfirmDialog() {
  confirmDialog.classList.remove("show");
  confirmDialog.setAttribute("aria-hidden", "true");
}

// Tombol Batal
cancelRemove?.addEventListener("click", () => {
  pendingRemoveId = null;
  closeConfirmDialog();
});

// Tombol Konfirmasi Hapus
confirmRemove?.addEventListener("click", () => {
  if (!pendingRemoveId) return;

  let bookmarks = getBookmarks().filter((x) => x !== pendingRemoveId);
  saveBookmarks(bookmarks);

  showToast("❌ Bookmark dihapus");
  deactivateBaitBookmark(pendingRemoveId);
  renderBookmarkList();

  pendingRemoveId = null;
  closeConfirmDialog();
});

// =============================
// 🔹 Utility Function
// =============================
function getBookmarks() {
  return JSON.parse(localStorage.getItem("bookmarks") || "[]")
    .map(Number)
    .filter((id) => Number.isFinite(id) && id > 0);
}

function saveBookmarks(bookmarks) {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

// Hilangkan status aktif dari tombol bookmark bait tertentu
function deactivateBaitBookmark(id) {
  const btn =
    document.querySelector(`.bait[data-bait-index="${id}"] .btn-bookmark`) ||
    document.querySelector(`.bait[data-id="${id}"] .btn-bookmark`);
  if (btn) btn.classList.remove("active");
}

// Tambahkan status aktif pada tombol bait tertentu
function updateBaitButtonState(id, active) {
  const btn =
    document.querySelector(`.bait[data-bait-index="${id}"] .btn-bookmark`) ||
    document.querySelector(`.bait[data-id="${id}"] .btn-bookmark`);
  if (btn) {
    btn.classList.toggle("active", active);
  }
}

// =============================
// 🔹 Event Awal
// =============================
bookmarkToggle?.addEventListener("click", toggleBookmarkPanel);
bookmarkOverlay?.addEventListener("click", closeBookmarkPanel);