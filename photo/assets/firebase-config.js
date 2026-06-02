// 1) FirebaseコンソールでWebアプリを作成
// 2) 表示された firebaseConfig を下の値に置き換えてください
// 3) このファイル名は firebase-config.js のまま使います

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const appSettings = {
  collectionName: "photo_posts",
  storagePath: "photo_posts",
  maxFileSizeMB: 6,
  maxImageLongSide: 1600,
  jpegQuality: 0.82,

  // 空文字なら管理者ページもコードなしで表示されます。
  // 例: "1234" にすると、admin.htmlで入力が必要になります。
  // 注意: これはソースを見れば分かる簡易ガードです。本格運用の認証ではありません。
  adminPin: ""
};
