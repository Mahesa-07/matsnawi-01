// 🌙 Matsnawi Digital — Final Versi (Bab + Subbab + Bookmark + Edit)
// (Lengkap: Sidebar, Subbab lazy-load, Render, Bookmark, Edit, Toast, Search)

// =========================
// VARIABEL GLOBAL
// =========================
let currentBab = null;
let currentSubbab = null;
let cacheSubbabs = {};
let baits = []; // current loaded bait array (subbab)
let showTranslation = true;
let baitOffset = 0; // offset global untuk penomoran berurutan
let editingBait = null;
let pendingRemoveId = null;

// =========================
// ELEMEN DOM (pastikan id di HTML sesuai)
// =========================
const baitContainer = document.getElementById("baitContainer");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

const langSwitch = document.getElementById("langSwitch");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");

const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkPanel = document.getElementById("bookmark-panel");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkOverlay = document.getElementById("bookmark-overlay");

const editPanel = document.getElementById("edit-panel");
const editinggris = document.getElementById("edit-inggris");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

// =========================
// BUILD SIDEBAR (Bab → Subbab → Bait Preview)
// =========================
// ==============================
// 🔹 Bangun Sidebar Bab & Subbab
// ==============================
async function buildSidebar() {
  const baitList = document.getElementById("baitList");
  baitList.innerHTML = "";

  const res = await fetch("./assets/data/index.json");
  const index = await res.json();

  index.files.forEach((bab) => {
    const babItem = document.createElement("div");
    babItem.className = "sidebar-bab";
    babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">${bab.title}</div>`;

    const subbabList = document.createElement("ul");
    subbabList.className = "subbab-list hidden";

    // 🔹 Loop subbab dalam bab
    bab.subbabs.forEach((sub, subIndex) => {
      const subItem = document.createElement("li");
      subItem.className = "subbab-item";
      subItem.innerHTML = `
        <div class="subbab-title" data-file="${sub.file}">
          ${sub.title}
          <span class="desc">${sub.description || ""}</span>
        </div>
        <ul class="bait-sublist hidden"></ul>
      `;
      subbabList.appendChild(subItem);

      const subTitle = subItem.querySelector(".subbab-title");
      const baitSublist = subItem.querySelector(".bait-sublist");

      // Klik subbab → tampilkan daftar bait (preview)
      subTitle.addEventListener("click", async () => {
        const visible = !baitSublist.classList.contains("hidden");
        document.querySelectorAll(".bait-sublist").forEach((l) => l.classList.add("hidden"));

        if (!visible) {
          await loadSubbabPreview(sub.file, baitSublist, bab, subIndex, sub);
          baitSublist.classList.remove("hidden");
        } else {
          baitSublist.classList.add("hidden");
        }
      });

      // Klik dua kali → langsung buka subbab utama
      subTitle.addEventListener("dblclick", () => {
        loadSubbab(sub.file, bab.bab, subIndex, sub.title);
        closeSidebar();
      });
    });

    // Klik bab → tampilkan daftar subbab
    const babTitle = babItem.querySelector(".bab-title");
    babTitle.addEventListener("click", () => {
      const visible = !subbabList.classList.contains("hidden");
      document.querySelectorAll(".subbab-list").forEach((l) => l.classList.add("hidden"));
      if (!visible) subbabList.classList.remove("hidden");
    });

    babItem.appendChild(subbabList);
    baitList.appendChild(babItem);
  });
}

// ==============================
// 🔹 Load daftar bait (preview) di sidebar
// ==============================
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
            <span class="bait-text">${b.indo.slice(0, 25)}...</span>
          </li>`
      )
      .join("");

    // Klik bait → buka subbab dan lompat ke bait
    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        await loadSubbab(sub.file, bab.bab, subIndex, sub.title);
        scrollToBait(Number(li.dataset.id));
        closeSidebar();
      });
    });
  } catch (err) {
    console.error("loadSubbabPreview error:", err);
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
  }
}

// =========================
// SIDEBAR TOGGLE
// =========================
function openSidebar() {
  sidebar.classList.add("show");
  menuToggle.textContent = "✖";
}
function closeSidebar() {
  sidebar.classList.remove("show");
  menuToggle.textContent = "☰";
}
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) closeSidebar();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});

// =========================
// LOAD SUBBAB (lazy-load + caching + calculate offset)
// =========================
async function loadSubbab(file, babIndex, subIndex, title) {
  try {
    if (!file) return;

    if (currentSubbab === file) {
      showToast(`⚠️ ${title} sudah aktif`);
      return;
    }

    const prevBab = currentBab;
    const prevSubbab = currentSubbab;

    currentBab = babIndex;
    currentSubbab = file;

    // 🔹 Jika sudah pernah di-cache
    if (cacheSubbabs[file]) {
      baits = cacheSubbabs[file].data;
      baitOffset = cacheSubbabs[file].offset;
      renderBaits(baits, baitOffset);
      showToast(`📖 ${title} (cached)`);
      return;
    }

    // 🔹 Coba pakai offset dari subbab sebelumnya (jika masih dalam bab sama)
    let offset = 0;
    if (prevBab === babIndex && cacheSubbabs[prevSubbab]) {
      const prevData = cacheSubbabs[prevSubbab].data;
      const prevOffset = cacheSubbabs[prevSubbab].offset;
      offset = prevOffset + prevData.length;
    } else {
      // 🔹 Hitung offset global (subbab sebelum subIndex aktif)
      const indexRes = await fetch("./assets/data/index.json");
      const index = await indexRes.json();

      for (const bab of index.files) {
        const subs = Array.isArray(bab.subbabs) ? bab.subbabs : [];

        // Tambahkan semua bait dari bab sebelum bab aktif
        if (bab.bab < babIndex) {
          for (const s of subs) {
            const res = await fetch(s.file);
            const data = await res.json();
            offset += data.length;
          }
        }

        // Kalau bab yang sama, tambahkan hanya subbab sebelum subIndex aktif
        else if (bab.bab === babIndex) {
          for (let i = 0; i < subIndex; i++) {
            const res = await fetch(subs[i].file);
            const data = await res.json();
            offset += data.length;
          }
          break;
        }
      }
    }

    // 🔹 Ambil data subbab aktif
    const res = await fetch(file);
    if (!res.ok) throw new Error("Gagal fetch subbab");
    const subBaits = await res.json();

    // 🔹 Simpan ke cache
    cacheSubbabs[file] = { data: subBaits, offset };

    baits = subBaits;
    baitOffset = offset;

    renderBaits(baits, baitOffset);
    showToast(`📖 ${title} dimuat`);
  } catch (err) {
    console.error("loadSubbab error:", err);
    showToast(`❌ Gagal memuat segarkan  halaman ${title}`);
  }
}

// =========================
// RENDER BAIT
// - penting: gunakan data-id = baitNumber (global) untuk bookmark/scroll
// - simpan data-bait-index = index dalam array baits agar edit mudah
// =========================
function renderBaits() {
  // animasi halaman lama naik dulu
  baitContainer.classList.add("bait-exit");

  setTimeout(() => {
    // setelah animasi keluar selesai, isi konten baru
    baitContainer.classList.remove("bait-exit");
    baitContainer.classList.add("bait-enter");
    baitContainer.innerHTML = baits
      .map((b, i) => {
        const baitNumber = baitOffset + i + 1;
        const descPart = b.description
          ? `<p class="bait-desc hidden">${b.description}</p>`
          : "";

        return `
          <div class="bait" data-id="${baitNumber}" data-bait-index="${i}">
            ${b.title ? `<h3 class="bait-title">${b.title}</h3>` : ""}
            <div class="text">${escapeHtml(showTranslation ? b.indo : b.inggris)}</div>
            ${descPart}
            <div class="bait-footer">
              <div class="bait-marker">﴾${baitNumber}﴿</div>
              <div class="bait-actions">
                <button class="btn-desc" title="Lihat Deskripsi">
                  <svg width="20" height="20"><use href="#icon-open"></use></svg>
                </button>
                <button class="btn-bookmark" title="Bookmark">
                  <svg width="20" height="20"><use href="#icon-bookmark"></use></svg>
                </button>
                <button class="btn-edit" title="Edit">
                  <svg width="20" height="20"><use href="#icon-edit"></use></svg>
                </button>
              </div>
            </div>
          </div>`;
      })
      .join("");

    addBaitListeners();
    addNextButtonIfEnd();

    // animasi masuk dari bawah
    requestAnimationFrame(() => {
      baitContainer.classList.add("bait-enter-active");
      setTimeout(() => {
        baitContainer.classList.remove("bait-enter", "bait-enter-active");
      }, 600);
    });
  }, 400); // waktu halaman lama keluar
}

function clearBaits() {
  const baitContainer = document.getElementById("baitContainer");
  if (baitContainer) {
    baitContainer.innerHTML = "";
    console.log("🌾 Semua bait telah dihapus (termasuk bait0).");
  }
}
// =========================
// 🌿 TOMBOL SELANJUTNYA DI AKHIR SUBBAB
// =========================
// =========================
// 🌿 TOMBOL SELANJUTNYA DI AKHIR SUBBAB (VERSI FIX)
// =========================
function addNextButtonIfEnd() {
  const oldBtn = document.querySelector(".next-sub-btn");
  if (oldBtn) oldBtn.remove();

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-sub-btn";
  nextBtn.innerHTML = "⟩⟩ Selanjutnya";

  nextBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("./assets/data/index.json");
      const index = await res.json();

      // cari bab aktif sekarang
      const babNow = index.files.find(b => b.bab === currentBab);
      if (!babNow) {
        showToast("⚠️ Data bab tidak ditemukan");
        return;
      }

      const subs = babNow.subbabs || [];
      const currentSubIndex = subs.findIndex(s => s.file === currentSubbab);

      // jika masih ada subbab berikutnya
      if (currentSubIndex < subs.length - 1) {
        const nextSub = subs[currentSubIndex + 1];
        await loadSubbab(nextSub.file, babNow.bab, currentSubIndex + 1, nextSub.title);
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast(`📖 ${nextSub.title} dimuat`);
      } 
      // jika sudah habis, coba lanjut ke bab berikutnya
      else {
        const babIndexNow = index.files.findIndex(b => b.bab === currentBab);
        if (babIndexNow < index.files.length - 1) {
          const nextBab = index.files[babIndexNow + 1];
          const nextSub = nextBab.subbabs?.[0];
          if (nextSub) {
            await loadSubbab(nextSub.file, nextBab.bab, 0, nextSub.title);
            window.scrollTo({ top: 0, behavior: "smooth" });
            showToast(`📖 ${nextSub.title} dimuat`);
          }
        } else {
          showToast("✨ Kamu sudah di akhir karya ini.");
        }
      }
    } catch (err) {
      console.error("Gagal lanjut:", err);
      showToast("⚠️ Tidak bisa memuat subbab berikutnya.");
    }
  });

  baitContainer.appendChild(nextBtn);
}


// small helper to avoid inserting raw HTML (safer)
function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =========================
// ADD LISTENERS FOR BAIT ACTIONS (edit / bookmark / desc)
// =========================
function addBaitListeners() {
  // Deskripsi toggle
  document.querySelectorAll(".btn-desc").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const desc = baitEl.querySelector(".bait-desc");
      if (!desc) return;
      desc.classList.toggle("hidden");
    };
  });

  // Bookmark toggle
  document.querySelectorAll(".btn-bookmark").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const id = parseInt(baitEl.dataset.id);
      toggleBookmark(id);
    };
  });

  // Edit open
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const idx = parseInt(baitEl.dataset.baitIndex, 10);
      if (Number.isNaN(idx)) return;
      editingBait = baits[idx];
      openEditPanel(editingBait);
    };
  });
}

// =========================
// SCROLL KE BAIT
// =========================
function scrollToBait(id) {
  const el = document.querySelector(`.bait[data-id='${id}']`);
  if (!el) {
    // jika saat ini belum load subbab yang mengandung bait ini,
    // kita bisa coba cari subbab yang punya bait dengan id global ini.
    // (untuk kesederhanaan: tampilkan toast)
    showToast("⚠️ Bait belum dimuat. Buka bab/subbab yang sesuai dahulu.");
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 1800);
}

// =========================
// EDIT PANEL
// =========================
function openEditPanel(bait) {
  editinggris.value = bait.inggris || "";
  editIndo.value = bait.indo || "";
  editPanel.setAttribute("aria-hidden", "false");
  editPanel.classList.add("show");
}
function closeEditPanel() {
  editPanel.classList.remove("show");
  editPanel.setAttribute("aria-hidden", "true");
  editingBait = null;
}
saveEditBtn.addEventListener("click", () => {
  if (!editingBait) return;
  editingBait.inggris = editinggris.value.trim();
  editingBait.indo = editIndo.value.trim();
  renderBaits();
  closeEditPanel();
  showToast("✅ Bait diperbarui (sementara)");
});
cancelEditBtn.addEventListener("click", closeEditPanel);

// =========================
// BOOKMARKS
// =========================


bookmarkToggle.addEventListener("click", toggleBookmarkPanel);
bookmarkOverlay.addEventListener("click", closeBookmarkPanel);


function toggleBookmarkPanel() {
  const isOpen = bookmarkPanel.classList.contains("show");
  isOpen ? closeBookmarkPanel() : openBookmarkPanel();
}
function openBookmarkPanel() {
  renderBookmarkList();
  bookmarkPanel.classList.add("show");
  bookmarkOverlay.classList.add("show");
}
function closeBookmarkPanel() {
  bookmarkPanel.classList.remove("show");
  bookmarkOverlay.classList.remove("show");
}

function toggleBookmark(id) {
  id = Number(id);
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  if (bookmarks.includes(id)) {
    // tanda hapus via confirm dialog
    pendingRemoveId = id;
    openConfirmDialog();
  } else {
    bookmarks.push(id);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    showToast("🔖 Ditambahkan ke Bookmark");
    renderBookmarkList();
  }
}

function renderBookmarkList() {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    .map(Number)
    .filter((id) => Number.isFinite(id) && id > 0); // hanya id valid

  // Bersihkan bookmark rusak dari storage
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  if (!bookmarks.length) {
    bookmarkList.innerHTML = "<p>Tidak ada bookmark.</p>";
    return;
  }

  bookmarkList.innerHTML = bookmarks
    .map(
      (id) => `
      <div class="bookmark-item" data-id="${id}">
        <span>Bait ${id}</span>
        <button class="remove-bookmark" title="Hapus">✖</button>
      </div>`
    )
    .join("");

  // Event tiap item
  bookmarkList.querySelectorAll(".bookmark-item").forEach((item) => {
    const id = Number(item.dataset.id);

    item.addEventListener("click", (e) => {
      // jika klik tombol hapus
      if (e.target.classList.contains("remove-bookmark")) {
        pendingRemoveId = id;
        openConfirmDialog(); // 🔹 panggil dialog konfirmasi
        e.stopPropagation();
        return;
      }

      // jika klik biasa → scroll ke bait
      scrollToBait(id);
      closeBookmarkPanel();
    });
  });
}

function removeBookmark(id) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  bookmarks = bookmarks.filter((x) => x !== id && Number.isFinite(x));
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  renderBookmarkList();
  showToast("❌ Bookmark dihapus");
}

// =========================
// KONFIRMASI HAPUS BOOKMARK
// =========================
function openConfirmDialog() {
  confirmDialog.setAttribute("aria-hidden", "false");
  confirmDialog.classList.add("show");
}
function closeConfirmDialog() {
  confirmDialog.classList.remove("show");
  confirmDialog.setAttribute("aria-hidden", "true");
}
cancelRemove.addEventListener("click", () => {
  pendingRemoveId = null;
  closeConfirmDialog();
});
confirmRemove.addEventListener("click", () => {
  if (!pendingRemoveId) return;
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  bookmarks = bookmarks.filter((id) => id !== pendingRemoveId);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  showToast("❌ Bookmark dihapus");
  closeConfirmDialog();
  renderBookmarkList();
  pendingRemoveId = null;
});

// =========================
// PENCARIAN
// =========================
searchInput?.addEventListener("input", () => {
  const query = (searchInput.value || "").toLowerCase().trim();
  if (!query) {
    renderBaits();
    return;
  }

  const filtered = baits.filter(
    (b) =>
      (b.inggris || "").toLowerCase().includes(query) ||
      (b.indo || "").toLowerCase().includes(query)
  );

  baitContainer.innerHTML = filtered
    .map((b, i) => {
      const globalNum = baitOffset + i + 1;
      const text = showTranslation ? b.indo : b.inggris;

      // soroti teks yang cocok
      const highlighted = text.replace(
        new RegExp(`(${query})`, "gi"),
        `<span class="highlight">$1</span>`
      );

      return `<div class="bait" data-id="${globalNum}">
        <div class="text">${highlighted}</div>
      </div>`;
    })
    .join("");
});
// =========================
// TOAST
// =========================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

// =========================
// UTAMA / INISIALISASI
// =========================

document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Bangun sidebar
  await buildSidebar();

  // 2️⃣ Auto-load subbab pertama (jika ada)
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    const firstFile = index.files?.[0]?.subbabs?.[0];
    if (firstFile && firstFile.file) {
      await loadSubbab(firstFile.file, index.files[0].bab, 0, firstFile.title);
    }
  } catch (err) {
    console.error("init load error:", err);
  }

  // 3️⃣ Tombol bahasa & tema
  langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    langSwitch.textContent = showTranslation ? "🇮🇩" : "🇬🇧";
    renderBaits(); // ← ini sebelumnya belum diindent & tanda kurungnya salah posisi
  });

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  }); // ← ini sebelumnya kurang tanda kurung tutup “)” dan “;”

  // 4️⃣ Efek klik untuk buka/tutup subbab (expand/collapse)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("subbab-title")) {
      const sublist = e.target.nextElementSibling;
      if (sublist && sublist.classList.contains("bait-sublist")) {
        sublist.classList.toggle("show");
      }
    }
  });

  console.log("✅ Matsnawi Digital aktif (Bookmark + Edit + Deskripsi)");
});
