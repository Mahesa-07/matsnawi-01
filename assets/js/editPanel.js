// ✏️ Edit Panel — Versi Lengkap + HTML Tag Support (pakai contenteditable)
import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";
import { setGlobals, getGlobals } from "./utils.js";

const editPanel = document.getElementById("edit-panel");
const editIndo = document.getElementById("edit-indo"); // contenteditable <div>

// ===============================
// 🎨 Toolbar Action
// ===============================
document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;
    document.execCommand(cmd, false, null);
    editIndo.focus();
  });
});
// 🎨 Palet warna - terapkan ke teks terpilih
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    document.execCommand("foreColor", false, color);
  });
});

const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const exportBtn = document.getElementById("exportEditsBtn");
const importBtn = document.getElementById("importEditsBtn");
const resetBtn = document.getElementById("resetEditsBtn");

// ===============================
// 🔹 Buka Panel Edit
// ===============================
export function openEditPanel(baitId = "", indoText = "") {
  // Masukkan isi HTML
  editIndo.innerHTML = indoText || "";
  setGlobals({ editingBait: { id: baitId, indo: indoText } });

  editPanel.setAttribute("aria-hidden", "false");
  editPanel.classList.add("show");
  editIndo.focus();
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

  // Ambil isi HTML, trim spasi kosong di luar
  const newIndo = editIndo.innerHTML.trim();
  const baits = globals.baits || [];

  // 🔸 Update data di memori global
  const bait = baits.find((b) => b.id === editing.id);
  if (bait) bait.indo = newIndo;

  // 🔸 Simpan ke localStorage
  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  edits[editing.id] = { indo: newIndo };
  localStorage.setItem("baitEdits", JSON.stringify(edits));

  // 🔸 Perbarui globals & render ulang
  setGlobals({ baits });
  renderBaits();

  closeEditPanel();
  showToast("✅ Perubahan disimpan (HTML aktif)");
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
      b.indo = edits[b.id].indo;
    }
  });
}

// ===============================
// 📤 EKSPOR Editan
// ===============================
exportBtn?.addEventListener("click", () => {
  const edits = JSON.parse(localStorage.getItem("baitEdits") || "{}");
  if (!Object.keys(edits).length) {
    showToast("⚠️ Tidak ada editan untuk diekspor");
    return;
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const filename = `bait_edits_${timestamp}.json`;

  const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`📦 Editan diekspor: ${filename}`);
});

// ===============================
// 📥 IMPOR Editan
// ===============================
importBtn?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        localStorage.setItem("baitEdits", JSON.stringify(imported));
        showToast(`✅ Editan dari "${file.name}" berhasil diimpor`);
        renderBaits();
      } catch (err) {
        console.error(err);
        showToast("❌ Gagal memuat file editan");
      }
    };
    reader.readAsText(file);
  };

  input.click();
});

// ===============================
// 🔄 RESET Editan Lokal
// ===============================
resetBtn?.addEventListener("click", () => {
  if (confirm("Yakin ingin menghapus semua editan lokal?")) {
    localStorage.removeItem("baitEdits");
    renderBaits();
    showToast("♻️ Semua editan lokal dihapus");
  }
});