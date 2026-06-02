import { appSettings } from "./firebase-config.js";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDate(value) {
  if (!value) return "日時不明";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getCurrentBaseUrl() {
  const path = location.pathname.replace(/[^/]+$/, "");
  return `${location.origin}${path}`;
}

export function getViewUrl(id) {
  return `${getCurrentBaseUrl()}view.html?id=${encodeURIComponent(id)}`;
}

export function saveMyPostId(id) {
  const key = "photoPostIds";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const next = [id, ...existing.filter((item) => item !== id)].slice(0, 50);
  localStorage.setItem(key, JSON.stringify(next));
}

export function getMyPostIds() {
  try {
    return JSON.parse(localStorage.getItem("photoPostIds") || "[]");
  } catch {
    return [];
  }
}

export function postCardHtml(post, { admin = false } = {}) {
  const id = post.id || "";
  const name = post.name ? escapeHtml(post.name) : "未入力";
  const comment = post.comment ? `<p class="comment">${escapeHtml(post.comment)}</p>` : "";
  const date = formatDate(post.createdAt || post.clientCreatedAt);
  const viewUrl = getViewUrl(id);
  const meta = admin
    ? `<dl class="meta"><div><dt>ID</dt><dd>${escapeHtml(id)}</dd></div><div><dt>投稿者</dt><dd>${name}</dd></div><div><dt>日時</dt><dd>${date}</dd></div></dl>`
    : `<p class="meta-line">${date}</p>`;
  return `
    <article class="post-card">
      <a class="photo-link" href="${viewUrl}">
        <img src="${escapeHtml(post.imageUrl)}" alt="投稿写真" loading="lazy" />
      </a>
      <div class="post-body">
        ${meta}
        ${comment}
        <div class="post-actions">
          <a href="${viewUrl}" class="small-link">確認URL</a>
          <button type="button" class="copy-link" data-url="${viewUrl}">URLコピー</button>
        </div>
      </div>
    </article>
  `;
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export async function resizeImage(file) {
  const maxSizeBytes = appSettings.maxFileSizeMB * 1024 * 1024;
  if (!file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選択してください。");
  }

  const imageBitmap = await createImageBitmap(file);
  const longSide = Math.max(imageBitmap.width, imageBitmap.height);
  const scale = Math.min(1, appSettings.maxImageLongSide / longSide);
  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", appSettings.jpegQuality));
  if (!blob) throw new Error("画像の変換に失敗しました。");
  if (blob.size > maxSizeBytes) {
    throw new Error(`画像サイズが大きすぎます。${appSettings.maxFileSizeMB}MB以下にしてください。`);
  }
  return blob;
}

export function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
