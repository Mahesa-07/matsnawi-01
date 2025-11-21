// ===============================
// 🤲 GESTURE — Swipe Buka/Tutup Sidebar
// ===============================
import { openSidebar, closeSidebar, getSidebarState } from "./sidebar.js";

export function initGestures() {
  const sidebar = document.getElementById("sidebar");
  const gestureArea = document.getElementById("gestureArea");

  if (!sidebar || !gestureArea) return;

  let startX = 0;

  // buka sidebar dari kiri layar
  gestureArea.addEventListener("touchstart", (e) => {
    if (getSidebarState()) return; // sidebar terbuka → abaikan
    startX = e.touches[0].clientX;
  });

  gestureArea.addEventListener("touchmove", (e) => {
    if (getSidebarState()) return;
    const diff = e.touches[0].clientX - startX;
    if (diff > 80) {
      openSidebar();
    }
  });

  // tutup sidebar dengan geser ke kiri
  sidebar.addEventListener("touchstart", (e) => {
    if (!getSidebarState()) return;
    startX = e.touches[0].clientX;
  });

  sidebar.addEventListener("touchmove", (e) => {
    if (!getSidebarState()) return;
    const diff = startX - e.touches[0].clientX;
    if (diff > 80) {
      closeSidebar();
    }
  });
}