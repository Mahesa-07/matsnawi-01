import { getGlobals, setGlobals } from "./utils.js";
import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";

const searchInput = document.getElementById("searchInput");
const baitContainer = document.getElementById("baitContainer");

// ========================
// 🔍 Pencarian Lintas Subbab
// ========================
searchInput?.addEventListener("input", async () => {
  const query = (searchInput.value || "").toLowerCase().trim();
  const { showTranslation } = getGlobals();

  if (!query) {
    showToast("Ketik kata untuk mencari bait di seluruh bab");
    return;
  }

  baitContainer.innerHTML = `<div class="loading">⏳ Mencari di seluruh karya...</div>`;

  try {
    const indexRes = await fetch("./assets/data/index.json");
    const index = await indexRes.json();

    let allResults = [];

    // 🔸 Telusuri setiap bab dan subbab
    for (const bab of index.files) {
      for (const sub of bab.subbabs) {
        const res = await fetch(sub.file);
        const json = await res.json();
        const baits = Array.isArray(json) ? json : json.baits || [];

        const matched = baits
          .map((b, i) => ({
            ...b,
            sourceBab: bab.title || `Bab ${bab.bab}`,
            sourceSub: sub.title || `Sub ${i + 1}`,
            file: sub.file,
            index: i + 1,
          }))
          .filter((b) => {
            const indo = (b.indo || "").toLowerCase();
            const eng = (b.inggris || "").toLowerCase();
            return indo.includes(query) || eng.includes(query);
          });

        allResults.push(...matched);
      }
    }

    // 🔸 Tampilkan hasil
    if (!allResults.length) {
      baitContainer.innerHTML = `
        <div class="no-results">
          ❌ Tidak ditemukan hasil untuk "<b>${query}</b>".
        </div>`;
      return;
    }

    baitContainer.innerHTML = allResults
      .map((b) => {
        const text = showTranslation ? b.inggris : b.indo;
        const highlighted = (text || "").replace(
          new RegExp(`(${query})`, "gi"),
          `<span class="highlight">$1</span>`
        );

        return `
          <div class="bait global-result">
            <div class="bait-meta">
              <small>${b.sourceBab} — ${b.sourceSub}</small>
            </div>
            <div class="bait-text">${highlighted}</div>
            <div class="bait-footer">
              <div class="bait-marker">📜 ${b.file.replace("./assets/data/", "")}</div>
            </div>
          </div>`;
      })
      .join("");

    showToast(`🔎 ${allResults.length} hasil ditemukan di seluruh karya`);
  } catch (err) {
    console.error("❌ Error global search:", err);
    showToast("Gagal melakukan pencarian global.");
  }
});