// ✏️ Edit Panel — Versi dengan Penyimpanan Lokal
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

  // 🔸 Update data global
  const bait = globals.baits.find((b) => b.id === editing.id);
  if (bait) {
    bait.inggris = newEng;
    bait.indo = newIndo;
  }

  // 🔸 Simpan ke localStorage agar bertahan sementara
  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  edits[editing.id] = { inggris: newEng, indo: newIndo };
  localStorage.setItem("baitEdits", JSON.stringify(edits));

  renderBaits();
  closeEditPanel();
  showToast("✅ Bait disimpan sementara (lokal)");
});

// ===============================
// 🔹 Batal Edit
// ===============================
cancelEditBtn?.addEventListener("click", closeEditPanel);

// ===============================
// 🔹 Terapkan edit dari localStorage saat render
// ===============================
export function applySavedEdits(baits) {
  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  baits.forEach((b) => {
    if (edits[b.id]) {
      b.inggris = edits[b.id].inggris;
      b.indo = edits[b.id].indo;
    }
  });
}