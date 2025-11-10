// -*- coding: utf-8 -*-
// ✏️ Edit Panel — Sinkron Versi Modular

import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";
import { setGlobals, getGlobals } from "./utils.js";

const editPanel = document.getElementById("edit-panel");
const editInggris = document.getElementById("edit-inggris");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// ===============================
// 🔹 Buka Panel Edit
// ===============================
export function openEditPanel(baitId, engText = "", indoText = "") {
  editInggris.value = engText;
  editIndo.value = indoText;
  setGlobals({ editingBait: { id: baitId, inggris: engText, indo: indoText } });

  editPanel.setAttribute("aria-hidden", "false");
  editPanel.classList.add("show");
}

// ===============================
// 🔹 Tutup Panel Edit
// ===============================
export function closeEditPanel() {
  editPanel.classList.remove("show");
  editPanel.setAttribute("aria-hidden", "true");
  setGlobals({ editingBait: null });
}

// ===============================
// 🔹 Simpan Perubahan
// ===============================
saveEditBtn?.addEventListener("click", () => {
  const globals = getGlobals();
  const editing = globals.editingBait;
  if (!editing) return;

  const newEng = editInggris.value.trim();
  const newIndo = editIndo.value.trim();

  // Update data global (sementara, tidak ke file JSON)
  const bait = globals.baits.find((b) => b.id === editing.id);
  if (bait) {
    bait.inggris = newEng;
    bait.indo = newIndo;
  }

  renderBaits();
  closeEditPanel();
  showToast("✅ Bait diperbarui (sementara)");
});

// ===============================
// 🔹 Batal Edit
// ===============================
cancelEditBtn?.addEventListener("click", closeEditPanel);