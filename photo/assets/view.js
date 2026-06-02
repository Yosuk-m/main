import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";
import { appSettings } from "./firebase-config.js";
import { copyText, escapeHtml, formatDate } from "./utils.js";

const postEl = document.getElementById("post");
const message = document.getElementById("message");
const id = new URLSearchParams(location.search).get("id");

if (!id) {
  message.textContent = "確認URLが正しくありません。";
} else {
  loadPost(id);
}

async function loadPost(postId) {
  postEl.innerHTML = `<p class="empty">読み込み中…</p>`;
  try {
    const snap = await getDoc(doc(db, appSettings.collectionName, postId));
    if (!snap.exists()) {
      postEl.innerHTML = "";
      message.textContent = "投稿が見つかりませんでした。";
      return;
    }
    const post = { id: snap.id, ...snap.data() };
    postEl.innerHTML = `
      <img class="single-photo" src="${escapeHtml(post.imageUrl)}" alt="投稿写真" />
      <dl class="meta meta--single">
        <div><dt>投稿日時</dt><dd>${formatDate(post.createdAt || post.clientCreatedAt)}</dd></div>
        <div><dt>お名前・番号など</dt><dd>${post.name ? escapeHtml(post.name) : "未入力"}</dd></div>
        ${post.comment ? `<div><dt>コメント</dt><dd>${escapeHtml(post.comment)}</dd></div>` : ""}
      </dl>
      <button id="copyThis" type="button" class="button button--secondary">このURLをコピー</button>
    `;
    document.getElementById("copyThis").addEventListener("click", async () => {
      await copyText(location.href);
      message.textContent = "URLをコピーしました。";
    });
  } catch (error) {
    console.error(error);
    postEl.innerHTML = "";
    message.textContent = "読み込みに失敗しました。";
  }
}
