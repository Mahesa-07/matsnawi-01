// -*- coding: utf-8 -*-
// ✏️ editPanel.js — Panel Edit Bait (Final v3.3)
// ✅ Sinkron dengan renderBaits() dan localStorage

import { showToast } from "./toast.js";
import { getGlobals, setGlobals } from "./utils.js";
import { renderBaits } from "./subbab.js";

const editPanel = document.getElementById("edit-panel");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");

// =========================
// 🔹 Buka Panel Edit
// =========================
export function openEditPanel(baitId, indoText = "") {
  editIndo.value = indoText;
  setGlobals({ editingBait: { id: baitId, indo: indoText } });

  editPanel.classList.add("open");
  editPanel.style.transform = "translate(-50%, -50%) scale(1)";
  editPanel.style.opacity = "1";
}

// =========================
// 🔹 Tutup Panel Edit
// =========================
export function closeEditPanel() {
  editPanel.classList.remove("open");
  editPanel.style.transform = "translate(-50%, -50%) scale(0.9)";
  editPanel.style.opacity = "0";
}

// =========================
// 🔹 Simpan Edit
// =========================
saveEditBtn?.addEventListener("click", () => {
  const { editingBait, baits, baitOffset } = getGlobals();
  if (!editingBait) return showToast("⚠️ Tidak ada bait aktif untuk disimpan.");

  const newIndo = editIndo.value.trim();
  if (!newIndo) return showToast("⚠️ Teks tidak boleh kosong.");

  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  edits[editingBait.id] = newIndo;
  localStorage.setItem("baitEdits", JSON.stringify(edits));

  // 🔹 Update data global
  const bait = baits.find((b) => b.id === editingBait.id);
  if (bait) bait.indo = newIndo;

  // 🔹 Update tampilan langsung (tanpa reload)
  const el = document.querySelector(`.bait[data-id='${editingBait.id}'] .bait-indo`);
  if (el) el.textContent = newIndo;

  // 🔹 Render ulang (pastikan sinkron)
  renderBaits(baits, baitOffset);

  closeEditPanel();
  showToast("✅ Bait disimpan (lokal)");
});

// =========================
// 🔹 Batalkan Edit
// =========================
cancelEditBtn?.addEventListener("click", () => {
  closeEditPanel();
  showToast("❌ Edit dibatalkan");
});

// =========================
// 🔹 Terapkan Edit dari localStorage
// =========================
export function applySavedEdits(baits) {
  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  for (const [id, text] of Object.entries(edits)) {
    const bait = baits.find((b) => b.id == id);
    if (bait) bait.indo = text;
  }
}