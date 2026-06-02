import { collection, doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getDownloadURL, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { db, storage } from "./firebase.js";
import { appSettings } from "./firebase-config.js";
import { copyText, getMyPostIds, getViewUrl, postCardHtml, resizeImage, saveMyPostId } from "./utils.js";

const form = document.getElementById("postForm");
const fileInput = document.getElementById("photo");
const previewWrap = document.getElementById("previewWrap");
const preview = document.getElementById("preview");
const message = document.getElementById("message");
const progress = document.getElementById("progress");
const submitBtn = document.getElementById("submitBtn");
const myPosts = document.getElementById("myPosts");
const reloadMine = document.getElementById("reloadMine");

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) {
    previewWrap.classList.add("hidden");
    return;
  }
  preview.src = URL.createObjectURL(file);
  previewWrap.classList.remove("hidden");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const file = fileInput.files?.[0];
  if (!file) {
    message.textContent = "写真を選択してください。";
    return;
  }

  submitBtn.disabled = true;
  progress.classList.remove("hidden");
  progress.value = 0;

  try {
    message.textContent = "画像を準備しています…";
    const resizedBlob = await resizeImage(file);
    const postRef = doc(collection(db, appSettings.collectionName));
    const imagePath = `${appSettings.storagePath}/${postRef.id}.jpg`;
    const imageRef = ref(storage, imagePath);

    message.textContent = "アップロードしています…";
    const uploadTask = uploadBytesResumable(imageRef, resizedBlob, {
      contentType: "image/jpeg",
      customMetadata: { postId: postRef.id }
    });

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          progress.value = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        reject,
        resolve
      );
    });

    const imageUrl = await getDownloadURL(imageRef);
    const payload = {
      id: postRef.id,
      name: document.getElementById("name").value.trim().slice(0, 60),
      comment: document.getElementById("comment").value.trim().slice(0, 300),
      imageUrl,
      imagePath,
      createdAt: serverTimestamp(),
      clientCreatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent.slice(0, 180)
    };
    await setDoc(postRef, payload);
    saveMyPostId(postRef.id);

    const url = getViewUrl(postRef.id);
    message.innerHTML = `投稿しました。<a href="${url}">確認URLを開く</a>`;
    form.reset();
    previewWrap.classList.add("hidden");
    await loadMyPosts();
  } catch (error) {
    console.error(error);
    message.textContent = error.message || "投稿に失敗しました。設定を確認してください。";
  } finally {
    submitBtn.disabled = false;
    progress.classList.add("hidden");
  }
});

reloadMine.addEventListener("click", loadMyPosts);

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-link");
  if (!button) return;
  await copyText(button.dataset.url);
  button.textContent = "コピー済み";
  setTimeout(() => (button.textContent = "URLコピー"), 1400);
});

async function loadMyPosts() {
  const ids = getMyPostIds();
  if (!ids.length) {
    myPosts.innerHTML = `<p class="empty">この端末からの投稿はまだありません。</p>`;
    return;
  }
  myPosts.innerHTML = `<p class="empty">読み込み中…</p>`;
  const posts = [];
  for (const id of ids) {
    const snap = await getDoc(doc(db, appSettings.collectionName, id));
    if (snap.exists()) posts.push({ id: snap.id, ...snap.data() });
  }
  myPosts.innerHTML = posts.length
    ? posts.map((post) => postCardHtml(post)).join("")
    : `<p class="empty">投稿データが見つかりませんでした。</p>`;
}

loadMyPosts();
