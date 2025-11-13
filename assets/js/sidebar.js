// -*- coding: utf-8 -*-
// 🌒 sidebar.js — Final Stabil + Fix Tombol Menu & Gesture Area Bawah-Kiri

import { loadSubbab } from "./subbab.js";
import { showToast } from "./toast.js";

// =============================
// 🔹 Ambil Elemen DOM
// =============================
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const baitList = document.getElementById("baitList");

// =============================
// 🔹 Efek Flash Awal
// =============================
function flashSidebar(duration = 800) {
  if (!sidebar || !menuToggle) return;
  sidebar.classList.add("show");
  menuToggle.textContent = "✖";
  setTimeout(() => {
    sidebar.classList.remove("show");
    menuToggle.textContent = "☰";
  }, duration);
}

// =============================
// 🔹 Fungsi Build Sidebar
// =============================
export async function buildSidebar() {
  if (!baitList) {
    console.warn("⚠️ Elemen #baitList tidak ditemukan.");
    return;
  }

  baitList.innerHTML = "";

  try {
    const res = await fetch("./assets/data/index.json");
    if (!res.ok) throw new Error("Gagal memuat index.json");
    const index = await res.json();

    for (const bab of index.files) {
      const babItem = document.createElement("div");
      babItem.className = "sidebar-bab";
      babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">${bab.title}</div>`;

      const subbabList = document.createElement("ul");
      subbabList.className = "subbab-list hidden";

      for (let i = 0; i < bab.subbabs.length; i++) {
        const sub = bab.subbabs[i];
        const subItem = document.createElement("li");
        subItem.className = "subbab-item";
        subItem.innerHTML = `
          <div class="subbab-title" data-file="${sub.file}">
            ${sub.title}
            ${sub.description ? `<span class="desc">${sub.description}</span>` : ""}
          </div>
          <ul class="bait-sublist hidden"></ul>
        `;
        subbabList.appendChild(subItem);

        const subTitle = subItem.querySelector(".subbab-title");
        const baitSublist = subItem.querySelector(".bait-sublist");

        subTitle.addEventListener("click", async () => {
          const visible = !baitSublist.classList.contains("hidden");
          document.querySelectorAll(".bait-sublist").forEach(l => l.classList.add("hidden"));
          if (!visible) {
            await loadSubbabPreview(sub.file, baitSublist, bab, i, sub);
            baitSublist.classList.remove("hidden");
          } else baitSublist.classList.add("hidden");
        });

        subTitle.addEventListener("dblclick", () => {
          loadSubbab(sub.file, bab.bab, i, sub.title);
          closeSidebar();
        });
      }

      const babTitle = babItem.querySelector(".bab-title");
      babTitle.addEventListener("click", () => {
        const visible = !subbabList.classList.contains("hidden");
        document.querySelectorAll(".subbab-list").forEach(l => l.classList.add("hidden"));
        if (!visible) subbabList.classList.remove("hidden");
      });

      babItem.appendChild(subbabList);
      baitList.appendChild(babItem);
    }

    if (!window._sidebarFlashed) {
      window._sidebarFlashed = true;
      flashSidebar();
    }
  } catch (err) {
    console.error("❌ buildSidebar error:", err);
    baitList.innerHTML = "<li>⚠️ Gagal memuat daftar Bab</li>";
    showToast("Tidak bisa memuat daftar Bab.");
  }
}

// =============================
// 🔹 Fungsi Preview Bait
// =============================
async function loadSubbabPreview(file, subList, bab, subIndex, sub) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Gagal memuat ${file}`);
    const data = await res.json();

    subList.innerHTML = data
      .map(
        b => `
        <li class="bait-item" data-id="${b.id}">
          <span class="bait-number">${b.id}.</span>
          <span class="bait-text">${(b.indo || "").slice(0, 30)}...</span>
        </li>`
      )
      .join("");

    subList.querySelectorAll(".bait-item").forEach(li => {
      li.addEventListener("click", async () => {
        await loadSubbab(sub.file, bab.bab, subIndex, sub.title);
        const id = Number(li.dataset.id);
        const el = document.querySelector(`.bait[data-id='${id}']`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        closeSidebar();
      });
    });
  } catch (err) {
    console.error("❌ loadSubbabPreview error:", err);
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
  }
}

// =============================
// 🔹 Kontrol Sidebar
// =============================
export function openSidebar() {
  sidebar.classList.add("show");
  sidebar.style.transform = "translateX(0)";
  sidebar.style.opacity = "1";
  sidebar.style.pointerEvents = "auto";
  menuToggle.textContent = "✖";
}
export function closeSidebar() {
  sidebar.classList.remove("show");
  sidebar.style.transform = "translateX(-105%)";
  sidebar.style.opacity = "0";
  sidebar.style.pointerEvents = "none";
  menuToggle.textContent = "☰";
}
export function toggleSidebar() {
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
}

// =============================
// 🔹 Inisialisasi Event + Gesture Area
// =============================
document.addEventListener("DOMContentLoaded", () => {
  if (!menuToggle || !sidebar) return;

  // Klik tombol menu
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // ESC → tutup
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
  });

  // Klik luar sidebar → tutup
  document.addEventListener("click", e => {
    const target = e.target;
    if (!sidebar.contains(target) && !menuToggle.contains(target)) {
      closeSidebar();
    }
  });

  // ==========================================
  // 🟢 Gesture Area Transparan Kiri-Bawah
  // ==========================================
  const gestureArea = document.createElement("div");
  gestureArea.id = "gesture-area";
  document.body.appendChild(gestureArea);

  Object.assign(gestureArea.style, {
    position: "fixed",
    left: "0",
    bottom: "0",
    width: "40px",
    height: "60%",
    zIndex: "99",
    background: "transparent",
    touchAction: "none",
  });

  let startX = 0;
  let currentX = 0;
  let touching = false;

  gestureArea.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touching = true;
    startX = e.touches[0].clientX;
  });

  gestureArea.addEventListener("touchmove", (e) => {
    if (!touching) return;
    currentX = e.touches[0].clientX;
    const translateX = Math.min(0, currentX - 270);
    sidebar.style.transform = `translateX(${translateX}px)`;
    sidebar.style.opacity = Math.min(1, (currentX / 270) * 1.2);
  });

  gestureArea.addEventListener("touchend", () => {
    if (!touching) return;
    touching = false;
    if (currentX > 90) openSidebar();
    else closeSidebar();
  });

  showToast?.("Gesture area kiri bawah aktif 🌙");
});