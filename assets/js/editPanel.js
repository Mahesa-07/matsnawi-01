// ✏️ Edit Panel — Versi Lengkap (Simpan Lokal + Ekspor/Impor/Reset + Dialog)
import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";
import { setGlobals, getGlobals } from "./utils.js";

const editPanel = document.getElementById("edit-panel");
const editInggris = document.getElementById("edit-inggris");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Tombol tambahan
const exportBtn = document.getElementById("exportEditsBtn");
const importBtn = document.getElementById("importEditsBtn");
const resetBtn = document.getElementById("resetEditsBtn");

// Dialog konfirmasi reset
const confirmDialog = document.createElement("div");
confirmDialog.className = "confirm-dialog";
confirmDialog.innerHTML = `
  <div class="confirm-box">
    <p>Yakin ingin menghapus semua edit lokal?</p>
    <div class="confirm-actions">
      <button id="cancelReset" class="btn-cancel">Batal</button>
      <button id="confirmReset" class="btn-confirm">Ya, Hapus</button>
    </div>
  </div>
`;
document.body.appendChild(confirmDialog);

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

  const bait = globals.baits.find((b) => b.id === editing.id);
  if (bait) {
    bait.inggris = newEng;
    bait.indo = newIndo;
  }

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
// 🔹 Terapkan edit dari localStorage
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

// ===============================
// 📤 Ekspor ke File JSON
// ===============================
exportBtn?.addEventListener("click", () => {
  const edits = localStorage.getItem("baitEdits");
  if (!edits || edits === "{}") return showToast("⚠️ Tidak ada data untuk diekspor");

  const blob = new Blob([edits], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "baitEdits.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("📤 Data edit berhasil diekspor");
});

// ===============================
// 📥 Impor dari File JSON
// ===============================
importBtn?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      localStorage.setItem("baitEdits", JSON.stringify(imported));
      renderBaits();
      showToast("📥 Data edit berhasil diimpor");
    } catch {
      showToast("❌ Gagal membaca file JSON");
    }
  };
  reader.readAsText(file);
});

// ===============================
// 🔄 Reset Semua Edit (Dengan Dialog)
// ===============================
resetBtn?.addEventListener("click", () => {
  confirmDialog.classList.add("show");
  confirmDialog.setAttribute("aria-hidden", "false");
});

confirmDialog.addEventListener("click", (e) => {
  if (e.target.id === "cancelReset" || e.target === confirmDialog) {
    confirmDialog.classList.remove("show");
    confirmDialog.setAttribute("aria-hidden", "true");
  }
  if (e.target.id === "confirmReset") {
    localStorage.removeItem("baitEdits");
    renderBaits();
    showToast("♻️ Semua edit lokal dihapus");
    confirmDialog.classList.remove("show");
    confirmDialog.setAttribute("aria-hidden", "true");
  }
});