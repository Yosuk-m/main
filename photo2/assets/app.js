(function () {
  const config = window.SITE_CONFIG || {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function setText(selector, text) {
    const el = $(selector);
    if (el && text) el.textContent = text;
  }

  function isPlaceholderUrl(url) {
    return !url || url.includes("example.com") || url.includes("PASTE_");
  }

  function initCommon() {
    setText("[data-site-title]", config.siteTitle || "写真投稿フォーム");
    setText("[data-site-subtitle]", config.subtitle || "スマホから写真を提出できます");
    setText("[data-org]", config.organizationName || "");
    document.title = config.siteTitle || document.title;
  }

  function initIndex() {
    const openButton = $("#openRequestButton");
    const urlWarning = $("#urlWarning");
    const photoInput = $("#photoInput");
    const previewBox = $("#previewBox");
    const previewImage = $("#previewImage");
    const previewName = $("#previewName");

    if (isPlaceholderUrl(config.onedriveFileRequestUrl)) {
      if (urlWarning) urlWarning.classList.remove("hidden");
      if (openButton) {
        openButton.setAttribute("aria-disabled", "true");
        openButton.addEventListener("click", function (event) {
          event.preventDefault();
          alert("assets/config.js にOneDriveのファイル要求リンクを設定してください。");
        });
      }
    } else if (openButton) {
      openButton.href = config.onedriveFileRequestUrl;
    }

    if (photoInput && config.allowLocalPreview !== false) {
      photoInput.addEventListener("change", function () {
        const file = photoInput.files && photoInput.files[0];
        if (!file) {
          previewBox.style.display = "none";
          return;
        }
        if (!file.type.startsWith("image/")) {
          alert("画像ファイルを選択してください。");
          photoInput.value = "";
          previewBox.style.display = "none";
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewName.textContent = `${file.name} / ${(file.size / 1024 / 1024).toFixed(1)} MB`;
          previewBox.style.display = "block";
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function initAdmin() {
    const gate = $("#adminGate");
    const content = $("#adminContent");
    const form = $("#passcodeForm");
    const input = $("#passcodeInput");
    const error = $("#passcodeError");
    const folderButton = $("#openFolderButton");
    const folderWarning = $("#folderWarning");

    if (isPlaceholderUrl(config.adminOnedriveFolderUrl)) {
      if (folderWarning) folderWarning.classList.remove("hidden");
      if (folderButton) {
        folderButton.addEventListener("click", function (event) {
          event.preventDefault();
          alert("assets/config.js に管理者用OneDriveフォルダURLを設定してください。");
        });
      }
    } else if (folderButton) {
      folderButton.href = config.adminOnedriveFolderUrl;
    }

    const requiredCode = config.adminPasscode || "";
    const unlocked = sessionStorage.getItem("adminUnlocked") === "true";

    function showContent() {
      if (gate) gate.classList.add("hidden");
      if (content) content.classList.remove("hidden");
      sessionStorage.setItem("adminUnlocked", "true");
    }

    if (!requiredCode || unlocked) {
      showContent();
      return;
    }

    if (gate) gate.classList.remove("hidden");
    if (content) content.classList.add("hidden");

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (input && input.value === requiredCode) {
          showContent();
        } else if (error) {
          error.classList.remove("hidden");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCommon();
    if (document.body.dataset.page === "index") initIndex();
    if (document.body.dataset.page === "admin") initAdmin();
  });
})();
