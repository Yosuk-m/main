import { collection, getDocs, limit, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";
import { appSettings } from "./firebase-config.js";
import { copyText, csvEscape, formatDate, postCardHtml } from "./utils.js";

const pinCard = document.getElementById("pinCard");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pin");
const pinMessage = document.getElementById("pinMessage");
const adminContent = document.getElementById("adminContent");
const postsEl = document.getElementById("posts");
const countEl = document.getElementById("count");
const refresh = document.getElementById("refresh");
const exportCsv = document.getElementById("exportCsv");

let loadedPosts = [];

function showAdmin() {
  pinCard.classList.add("hidden");
  adminContent.classList.remove("hidden");
  loadPosts();
}

if (appSettings.adminPin) {
  pinCard.classList.remove("hidden");
} else {
  showAdmin();
}

pinForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (pinInput.value === appSettings.adminPin) {
    sessionStorage.setItem("adminPinOk", "1");
    showAdmin();
  } else {
    pinMessage.textContent = "管理コードが違います。";
  }
});

if (sessionStorage.getItem("adminPinOk") === "1") showAdmin();
refresh.addEventListener("click", loadPosts);

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-link");
  if (!button) return;
  await copyText(button.dataset.url);
  button.textContent = "コピー済み";
  setTimeout(() => (button.textContent = "URLコピー"), 1400);
});

async function loadPosts() {
  postsEl.innerHTML = `<p class="empty">読み込み中…</p>`;
  countEl.textContent = "";
  try {
    const q = query(
      collection(db, appSettings.collectionName),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    const snapshot = await getDocs(q);
    loadedPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    countEl.textContent = `${loadedPosts.length}件の投稿を表示中`;
    postsEl.innerHTML = loadedPosts.length
      ? loadedPosts.map((post) => postCardHtml(post, { admin: true })).join("")
      : `<p class="empty">投稿はまだありません。</p>`;
  } catch (error) {
    console.error(error);
    postsEl.innerHTML = `<p class="empty">読み込みに失敗しました。Firebase設定とルールを確認してください。</p>`;
  }
}

exportCsv.addEventListener("click", () => {
  if (!loadedPosts.length) return;
  const header = ["id", "createdAt", "name", "comment", "imageUrl"];
  const rows = loadedPosts.map((post) => [
    post.id,
    formatDate(post.createdAt || post.clientCreatedAt),
    post.name || "",
    post.comment || "",
    post.imageUrl || ""
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `photo-posts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
