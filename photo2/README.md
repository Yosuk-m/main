# OneDriveファイル要求を使った写真投稿サイト

GitHub Pagesで公開できる、スマホ向けの写真投稿入口サイトです。
写真の保存はGitHubではなく、OneDriveの「ファイル要求」リンクに任せます。

## できること

- スマホから投稿ページを開く
- 写真を送信前に端末内でプレビューする
- OneDriveのファイル要求ページへ移動する
- 管理者はOneDriveフォルダで投稿写真を確認する
- サイト自体にはログイン画面なし

## 重要な制限

方法1は、OneDriveのファイル要求ページを使う簡易構成です。
そのため、投稿者がこのGitHub Pages上で「アップロード済み写真一覧」を見ることはできません。
投稿者が確認できるのは、OneDrive側のアップロード完了表示です。

投稿者にも投稿後の写真一覧を見せたい場合は、Power Automate、Microsoft Graph、Firebaseなどの別方式が必要です。

## ファイル構成

```text
.
├── index.html              # 投稿ページ
├── thanks.html             # 投稿後の案内ページ
├── admin.html              # 管理者向けページ
├── assets/
│   ├── config.js           # OneDrive URLなどの設定
│   ├── app.js              # 画面制御
│   └── style.css           # スマホ対応デザイン
└── README.md
```

## セットアップ手順

### 1. OneDriveで提出用フォルダを作る

例:

```text
写真投稿/
└── 提出写真/
```

### 2. OneDriveで「ファイル要求」リンクを作る

OneDriveの対象フォルダからファイル要求リンクを作成します。
作成したリンクをコピーしてください。

### 3. `assets/config.js` を編集する

```js
window.SITE_CONFIG = {
  siteTitle: "写真投稿フォーム",
  subtitle: "スマホから写真を提出できます",
  organizationName: "",
  onedriveFileRequestUrl: "ここにOneDriveのファイル要求リンクを貼る",
  adminOnedriveFolderUrl: "ここに管理者が開くOneDriveフォルダURLを貼る",
  adminPasscode: "", // 簡易コードを使うなら例: "1234"
  allowLocalPreview: true
};
```

### 4. GitHubにアップロードする

1. GitHubで新しいリポジトリを作成
2. このフォルダ内のファイルをアップロード
3. GitHub Pagesを有効化

GitHub Pagesの公開対象は通常、`main` ブランチの `/root` にします。

## 管理者ページについて

`admin.html` にはOneDriveフォルダへのリンクを置いています。
`adminPasscode` を設定すると簡易コード入力を表示できます。

ただし、これはJavaScript上の簡易ガードです。
GitHub Pages上に置くコードは閲覧できるため、本格的な認証にはなりません。
本番では管理者側の確認はOneDriveへのログインで保護してください。

## カスタマイズ例

### タイトル変更

`assets/config.js` の `siteTitle` を変更します。

### 組織名や学校名の表示

```js
organizationName: "〇〇学校"
```

### 簡易管理者コード

```js
adminPasscode: "1234"
```

## 運用上の注意

- OneDriveのファイル要求リンクは、必要な人だけに共有してください。
- 誰でも投稿できるリンクは、不要になったら無効化してください。
- 個人情報や顔写真を扱う場合は、保存期間・利用目的・管理者を明記してください。
- 写真一覧を公開ページに出す運用は避けてください。
