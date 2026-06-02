# 写真投稿サイト（GitHub Pages + Firebase）

スマホ利用者がログインなしで写真を投稿し、投稿者側・管理者側の両方で写真を確認できるWebサイトです。

## ファイル構成

- `index.html`：利用者の写真投稿ページ
- `view.html`：投稿後の確認ページ
- `admin.html`：管理者用の投稿一覧ページ
- `assets/`：CSSとJavaScript
- `firebase/firestore.rules`：Firestore用ルール
- `firebase/storage.rules`：Cloud Storage用ルール

## 重要な注意

GitHub Pagesは静的サイト用なので、写真ファイルの保存にはFirebaseを使います。
このサンプルは「ログインなし」を優先して、投稿データと画像を公開読み取りにしています。
管理者ページの `adminPin` は簡易ガードであり、本格的なセキュリティではありません。
公開イベント・学内の限定用途などで使う前提です。

本番運用では、Firebase App Check、Firebase Authentication、Cloud Functionsなどの追加を推奨します。

## セットアップ手順

### 1. Firebaseプロジェクトを作る

1. Firebase Consoleで新規プロジェクトを作成
2. Webアプリを追加
3. 表示された `firebaseConfig` を `assets/firebase-config.js` に貼り付け
4. Firestore Databaseを作成
5. Cloud Storageを作成

### 2. Firebaseルールを設定する

Firebase Consoleで以下を貼り付けます。

- Firestore Database > ルール：`firebase/firestore.rules`
- Storage > ルール：`firebase/storage.rules`

### 3. GitHub Pagesにアップロードする

1. GitHubで新しいリポジトリを作成
2. このフォルダ内のファイルをアップロード
3. Settings > Pages > Branch を `main` / `/root` に設定
4. 表示されたURLをスマホで開く

## 管理者ページ

- `https://あなたのGitHubPagesURL/admin.html`

`assets/firebase-config.js` の `adminPin` を空文字から変更すると、管理者ページでコード入力が必要になります。
ただし、これはフロントエンド上の簡易ガードです。ソースを見れば分かるため、秘密情報の保護には使えません。

## 利用者の確認方法

投稿後に確認URLが表示されます。利用者はそのURLを保存すると、別端末でも投稿写真を確認できます。
また、同じスマホの同じブラウザでは `自分の投稿` に履歴が残ります。
