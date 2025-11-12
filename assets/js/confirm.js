// -*- coding: utf-8 -*-
// ⚙️ confirm.js — Dialog Konfirmasi Umum (Reusable untuk Semua Modul)

let confirmDialog, confirmMessage, confirmYes, confirmNo;
let confirmCallback = null;

// ===============================
// 🔹 Inisialisasi Dialog
// ===============================
export function initConfirmDialog() {
  confirmDialog = document.getElementById("confirm-dialog");

  // kalau belum ada di DOM, buat default
  if (!confirmDialog) {
    confirmDialog = document.createElement("div");
    confirmDialog.id = "confirm-dialog";
    confirmDialog.setAttribute("aria-hidden", "true");
    confirmDialog.innerHTML = `
      <div class="confirm-box">
        <p class="confirm-message">Apakah kamu yakin?</p>
        <div class="confirm-actions">
          <button class="confirm-no">Batal</button>
          <button class="confirm-yes">Ya</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmDialog);
  }

  confirmMessage = confirmDialog.querySelector(".confirm-message");
  confirmYes = confirmDialog.querySelector(".confirm-yes");
  confirmNo = confirmDialog.querySelector(".confirm-no");

  confirmNo?.addEventListener("click", closeConfirmDialog);
  confirmDialog?.addEventListener("click", (e) => {
    if (e.target === confirmDialog) closeConfirmDialog();
  });
  confirmYes?.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    closeConfirmDialog();
  });
}

// ===============================
// 🔹 Buka Dialog
// ===============================
export function openConfirmDialog(message, onConfirm) {
  if (!confirmDialog) initConfirmDialog();

  confirmMessage.textContent = message;
  confirmCallback = onConfirm;
  confirmDialog.classList.add("show");
  confirmDialog.setAttribute("aria-hidden", "false");
}

// ===============================
// 🔹 Tutup Dialog
// ===============================
export function closeConfirmDialog() {
  confirmDialog?.classList.remove("show");
  confirmDialog?.setAttribute("aria-hidden", "true");
  confirmCallback = null;
}