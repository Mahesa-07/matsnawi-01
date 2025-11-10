// -*- coding: utf-8 -*-
// 🔍 Pencarian (Versi Sinkron dengan State Global dari utils.js)

import { setGlobals, getGlobals } from "./utils.js";
import { renderBaits } from "./subbab.js";
import { addBaitListeners } from "./baitActions.js";
import { showToast } from "./toast.js";
import { loadSubbab } from "./subbab.js"; // ✅ penting agar bisa buka subbab

const searchInput = document.getElementById("searchInput");
const baitContainer = document.getElementById("baitContainer");

let allBaitsCache = null; // cache lintas bab
let searching = false;

searchInput?.addEventListener("input", async () => {
  const query = (searchInput.value || "").toLowerCase().trim();
  if (!query) {
    const { baits, baitOffset } = getGlobals();
    renderBaits(baits, baitOffset);
    return;
  }

  if (searching) return;
  searching = true;

  // 🔹 Muat semua bait lintas bab (sekali saja)
  if (!allBaitsCache) {
    try {
      const indexRes = await fetch("./assets/data/index.json");
      const index = await indexRes.json();

      allBaitsCache = [];

      for (const bab of index.files) {
        for (let i = 0; i < bab.subbabs.length; i++) {
          const sub = bab.subbabs[i];
          const res = await fetch(sub.file);
          const arr = await res.json();
          const data = Array.isArray(arr) ? arr : arr.baits || [];

          data.forEach((b, baitIndex) => {
            allBaitsCache.push({
              ...b,
              babNum: bab.bab,
              babTitle: bab.title,
              subTitle: sub.title || "",
              file: sub.file,
              subIndex: i,
              baitIndex
            });
          });
        }
      }

      console.log(`✅ ${allBaitsCache.length} bait global dimuat`);
    } catch (err) {
      console.error("❌ Gagal memuat semua bait:", err);
      showToast("Gagal memuat data global.");
      searching = false;
      return;
    }
  }

  // 🔹 Filter berdasarkan teks Indonesia / Inggris
  const filtered = allBaitsCache.filter(
    (b) =>
      (b.indo || "").toLowerCase().includes(query) ||
      (b.inggris || "").toLowerCase().includes(query)
  );

  if (!filtered.length) {
    baitContainer.innerHTML = `
      <div class="no-results">
        ❌ Tidak ditemukan hasil untuk "<b>${query}</b>".
      </div>`;
    searching = false;
    return;
  }

  // 🔹 Render hasil pencarian
  const html = filtered
    .map((b, i) => {
      const text = (b.indo || b.inggris || "").replace(
        new RegExp(`(${query})`, "gi"),
        `<span class="highlight">$1</span>`
      );

      return `
        <div class="bait search-result"
             data-file="${b.file}"
             data-bab="${b.babNum}"
             data-sub="${b.subIndex}"
             data-title="${b.subTitle}">
          <div class="bait-content">
            <div class="bait-text">${text}</div>
            <div class="bait-meta">
              <small>📘 ${b.babTitle}${b.subTitle ? " › " + b.subTitle : ""}</small>
            </div>
          </div>
        </div>`;
    })
    .join("");

  baitContainer.innerHTML = `
    <div class="search-summary">
      Ditemukan <b>${filtered.length}</b> hasil untuk "<b>${query}</b>".
      <small>(Klik salah satu hasil untuk membuka subbab asalnya)</small>
    </div>
    ${html}`;

  // 🔹 Event klik hasil pencarian
  baitContainer.querySelectorAll(".search-result").forEach((el) => {
    el.addEventListener("click", async () => {
      const file = el.dataset.file;
      const bab = parseInt(el.dataset.bab);
      const subIndex = parseInt(el.dataset.sub);
      const title = el.dataset.title;

      showToast(`📖 Membuka ${title}...`);
      await loadSubbab(file, bab, subIndex, title);

      // Scroll ke atas agar fokus ke awal isi
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  searching = false;
});