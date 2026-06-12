# 情報I CBT アクセスログ対応版

## 重要
GitHub PagesはHTML/CSS/JavaScriptを配信する静的サイトホスティングです。HTML単体では、アクセスした人の情報をGitHubサーバ内に書き込むことはできません。

そのため、このパッケージには次の2種類を入れています。

- `info2026_01_accesslog_local.html`  
  管理者画面に「アクセスログ」タブを追加したHTMLです。`LOG_API_URL`が空欄のままなら、この端末の`localStorage`にだけ保存されます。
- `cloudflare-worker-github-log.js`  
  GitHubリポジトリ内の`logs/access.jsonl`などへ安全に追記するためのサーバ側API例です。GitHubトークンはHTMLに書かず、Cloudflare Workerの環境変数に保存します。

## HTML側の設定
`info2026_01_accesslog_local.html`内の次の行を、WorkerのURLに変更します。

```js
const LOG_API_URL="";
```

例:

```js
const LOG_API_URL="https://your-worker.yourname.workers.dev";
```

## Cloudflare Worker側の環境変数
Cloudflare Workerに以下を設定してください。

- `GITHUB_TOKEN`: GitHub fine-grained token。対象リポジトリのContentsにRead and write権限を付与
- `GITHUB_OWNER`: GitHubユーザー名または組織名
- `GITHUB_REPO`: ログ保存先リポジトリ名
- `GITHUB_BRANCH`: `main`など
- `LOG_PATH`: `logs/access.jsonl`など
- `ADMIN_PASSWORD`: HTMLの管理者パスワードと同じ値にするのがおすすめ
- `IP_HASH_SALT`: IPハッシュ化用の十分長い秘密文字列
- `ALLOWED_ORIGIN`: 公開するGitHub PagesのURL

## 記録される主な情報
- クラス番号、名前
- ログイン、試験開始、提出、ログアウト、管理者ログインの時刻
- 出題数、正解数、正答率、所要時間
- ブラウザのUser-Agent、言語、画面サイズ、タイムゾーン
- サーバ連携時はIPアドレスをそのまま保存せず、既定でハッシュ化した値を保存

## 注意
- HTMLにGitHub Personal Access Tokenを直接書かないでください。閲覧者に見えてしまいます。
- 個人情報を収集するため、利用目的・保存期間・管理者を学習者に明示してください。
- 多人数が同時に送信する場合、GitHubファイル追記は競合することがあります。本格運用ではSupabase、Firebase、Cloudflare D1などのDB利用を推奨します。
