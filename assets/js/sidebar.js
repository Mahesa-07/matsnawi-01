// -*- coding: utf-8 -*-
// 📚 sidebar.js — FINAL VERSION (Unlimited Scroll + Stable + Smooth)

import { loadSubbab } from "./subbab.js";
import { showToast } from "./toast.js";

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const baitList = document.getElementById("baitList");

// =============================
// ⚡ Flash sidebar pertama kali
// =============================
function flashSidebar(duration = 800) {
  sidebar.classList.add("show");
  menuToggle.textContent = "✖";
  setTimeout(() => {
    sidebar.classList.remove("show");
    menuToggle.textContent = "☰";
  }, duration);
}

// =============================
// 🧭 Build Sidebar Utama
// =============================
export async function buildSidebar() {
  if (!baitList) {
    console.warn("⚠️ Elemen #baitList tidak ditemukan di DOM.");
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
      babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">
        <span>${bab.title}</span>
        <span class="arrow">▶</span>
      </div>`;

      const subbabList = document.createElement("ul");
      subbabList.className = "subbab-list";

      // 🔸 Loop setiap subbab
      bab.subbabs.forEach((sub, subIndex) => {
        const subItem = document.createElement("li");
        subItem.className = "subbab-item";
        subItem.innerHTML = `
          <div class="subbab-title" data-file="${sub.file}">
            ${sub.title}
            ${sub.description ? `<span class="desc">${sub.description}</span>` : ""}
          </div>
          <ul class="bait-sublist"></ul>
        `;
        subbabList.appendChild(subItem);

        const subTitle = subItem.querySelector(".subbab-title");
        const baitSublist = subItem.querySelector(".bait-sublist");

        // Klik sekali = buka/tutup preview bait
        subTitle.addEventListener("click", async (e) => {
          e.stopPropagation();
          const isVisible = baitSublist.classList.contains("show");

          // Tutup bait lain di dalam subbab yang sama
          subItem.parentElement.querySelectorAll(".bait-sublist.show").forEach(l => {
            l.classList.remove("show");
            l.style.maxHeight = "0px";
          });

          if (!isVisible) {
            await loadSubbabPreview(sub.file, baitSublist, bab, subIndex, sub);
            baitSublist.classList.add("show");

            // FIX: Scroll tanpa batas
            baitSublist.style.maxHeight = "9999px";
          } else {
            baitSublist.classList.remove("show");
            baitSublist.style.maxHeight = "0px";
          }
        });

        // Klik dua kali = langsung buka subbab
        subTitle.addEventListener("dblclick", () => {
          loadSubbab(sub.file, bab.bab, subIndex, sub.title);
          closeSidebar();
        });
      });

      const babTitle = babItem.querySelector(".bab-title");
      babTitle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isVisible = subbabList.classList.contains("show");

        // Tutup semua subbab lain
        document.querySelectorAll(".subbab-list.show").forEach(list => {
          list.classList.remove("show");
          list.style.maxHeight = "0px";
          list.previousElementSibling?.classList.remove("show");
        });

        if (!isVisible) {
          subbabList.classList.add("show");

          // FIX unlimited scroll
          subbabList.style.maxHeight = "9999px";

          babTitle.classList.add("show");
        } else {
          subbabList.classList.remove("show");
          subbabList.style.maxHeight = "0px";
          babTitle.classList.remove("show");
        }
      });

      babItem.appendChild(subbabList);
      baitList.appendChild(babItem);
    }

    // Flash sidebar pertama kali
    if (!window._sidebarFlashed) {
      window._sidebarFlashed = true;
      flashSidebar(800);
    }

  } catch (err) {
    console.error("❌ buildSidebar error:", err);
    baitList.innerHTML = "<li>⚠️ Gagal memuat daftar Bab</li>";
    showToast("Tidak bisa memuat daftar Bab.");
  }
}

// =============================
// 🪶 Memuat preview bait
// =============================
async function loadSubbabPreview(file, subList, bab, subIndex, sub) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Gagal memuat ${file}`);
    const data = await res.json();

    subList.innerHTML = data
      .map(
        (b) => `
        <li class="bait-item" data-id="${b.id}">
          <span class="bait-number">${b.id}.</span>
          <span class="bait-text">${(b.indo || "").slice(0, 35)}...</span>
        </li>`
      )
      .join("");

    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        await loadSubbab(sub.file, bab.bab, subIndex, sub.title);

        const id = Number(li.dataset.id);
        const el = document.querySelector(`.bait[data-id='${id}']`);

        if (el) {
          // Hapus highlight sebelumnya
          document
            .querySelectorAll(".bait.highlighted")
            .forEach((b) => b.classList.remove("highlighted"));

          // Scroll lembut ke bait dan tambahkan highlight
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          requestAnimationFrame(() => {
            el.classList.add("highlighted");
          });

          // Hilangkan highlight perlahan
          setTimeout(() => el.classList.remove("highlighted"), 2000);
        }

        closeSidebar();
      });
    });
  } catch (err) {
    console.error("❌ loadSubbabPreview error:", err);
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
  }
}

// =============================
// 🎛️ Kontrol Sidebar
// =============================
export function openSidebar() {
  sidebar.classList.add("show");
  menuToggle.textContent = "✖";
}
export function closeSidebar() {
  sidebar.classList.remove("show");
  menuToggle.textContent = "☰";
}

// =============================
// 🧩 Event Global
// =============================
menuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});

document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) closeSidebar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});