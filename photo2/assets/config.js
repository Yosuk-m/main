// OneDriveファイル要求リンク用の設定ファイル
// 1. onedriveFileRequestUrl に、OneDriveで作成した「ファイル要求」リンクを貼り付けます。
// 2. adminOnedriveFolderUrl に、管理者が写真を確認するOneDriveフォルダURLを貼り付けます。
// 3. adminPasscode は簡易的な管理者ページ用コードです。空欄ならコード入力なしになります。
//    注意: GitHub Pages上のJavaScriptに書くため、本格的な認証にはなりません。

window.SITE_CONFIG = {
  siteTitle: "写真投稿フォーム",
  subtitle: "スマホから写真を提出できます",
  organizationName: "",
  onedriveFileRequestUrl: "https://sistkanri-my.sharepoint.com/:f:/g/personal/matsumura_yosuke_sist_ac_jp/IgC3tsY6u_f4SqEI32tUNeaSAc8-gqaTdqN0bPPMCHEIZ9s",
  adminOnedriveFolderUrl: "https://sistkanri-my.sharepoint.com/:f:/g/personal/matsumura_yosuke_sist_ac_jp/IgC3tsY6u_f4SqEI32tUNeaSAdRPoo1x71ptF7EHuIYb9dg?e=LSE43T",
  adminPasscode: "", // 例: "1234"。空欄なら不要。
  allowLocalPreview: true
};
