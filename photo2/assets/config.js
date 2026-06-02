// OneDriveファイル要求リンク用の設定ファイル
// 1. onedriveFileRequestUrl に、OneDriveで作成した「ファイル要求」リンクを貼り付けます。
// 2. adminOnedriveFolderUrl に、管理者が写真を確認するOneDriveフォルダURLを貼り付けます。
// 3. adminPasscode は簡易的な管理者ページ用コードです。空欄ならコード入力なしになります。
//    注意: GitHub Pages上のJavaScriptに書くため、本格的な認証にはなりません。

window.SITE_CONFIG = {
  siteTitle: "写真投稿フォーム",
  subtitle: "スマホから写真を提出できます",
  organizationName: "",
  onedriveFileRequestUrl: "https://example.com/PASTE_ONEDRIVE_FILE_REQUEST_URL_HERE",
  adminOnedriveFolderUrl: "https://example.com/PASTE_ADMIN_ONEDRIVE_FOLDER_URL_HERE",
  adminPasscode: "", // 例: "1234"。空欄なら不要。
  allowLocalPreview: true
};
