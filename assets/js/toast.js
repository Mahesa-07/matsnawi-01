// -*- coding: utf-8 -*-
// 🍞 Toast Notification (ESM Safe, Auto-Cleanup)

let activeToast = null;

/**
 * Menampilkan pesan toast sementara di layar.
 * @param {string} msg - Pesan yang ingin ditampilkan.
 * @param {number} duration - Lama tampil dalam ms (default 2000).
 */
export function showToast(msg, duration = 2000) {
  // Hapus toast sebelumnya kalau masih aktif
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = msg;
  document.body.appendChild(toast);
  activeToast = toast;

  // Trigger animasi muncul
  requestAnimationFrame(() => toast.classList.add("show"));

  // Hilangkan setelah durasi tertentu
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
      if (activeToast === toast) activeToast = null;
    }, 500);
  }, duration);
}