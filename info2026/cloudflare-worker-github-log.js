// cloudflare-worker-github-log.js
// GitHub PagesのHTMLから送られたアクセスログを、GitHubリポジトリ内のJSONLファイルに追記するCloudflare Workerです。
// 必要な環境変数:
//   GITHUB_TOKEN: private repoへのContents書き込み権限を持つfine-grained token
//   GITHUB_OWNER: リポジトリ所有者
//   GITHUB_REPO: リポジトリ名
//   GITHUB_BRANCH: main など
//   LOG_PATH: logs/access.jsonl など
//   ADMIN_PASSWORD: 管理者ログ取得用パスワード
//   IP_HASH_SALT: IPハッシュ化用の秘密文字列
//   ALLOWED_ORIGIN: GitHub PagesのURL。例 https://ユーザー名.github.io

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });

    try {
      if (url.pathname === '/log' && request.method === 'POST') {
        const body = await request.json();
        const safe = sanitizeLog(body);
        safe.serverTime = new Date().toISOString();
        safe.ipHash = await hashText((request.headers.get('CF-Connecting-IP') || '') + ':' + (env.IP_HASH_SALT || ''));
        safe.country = request.headers.get('CF-IPCountry') || '';
        await appendJsonl(env, safe);
        return json({ ok: true }, headers);
      }

      if (url.pathname === '/logs' && request.method === 'GET') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (!env.ADMIN_PASSWORD || pw !== env.ADMIN_PASSWORD) return json({ error: 'unauthorized' }, headers, 401);
        const text = await readLogText(env);
        const logs = text.trim() ? text.trim().split('\n').map(line => {
          try { return JSON.parse(line); } catch { return { parseError: true, raw: line }; }
        }) : [];
        return json({ ok: true, logs }, headers);
      }

      return json({ error: 'not found' }, headers, 404);
    } catch (err) {
      return json({ error: String(err.message || err) }, headers, 500);
    }
  }
};

function corsHeaders(env) {
  const origin = env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Password',
    'Content-Type': 'application/json; charset=utf-8'
  };
}
function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}
function sanitizeLog(x) {
  const allowed = ['id','sessionId','action','timestamp','localTime','classNo','name','page','referrer','userAgent','language','platform','timezone','screen','viewport','admin','category','questionCount','questionIds','answered','total','correct','rate','durationSec'];
  const out = {};
  for (const k of allowed) {
    if (x[k] === undefined) continue;
    if (typeof x[k] === 'string') out[k] = x[k].slice(0, 1000);
    else if (typeof x[k] === 'number' || typeof x[k] === 'boolean' || x[k] === null) out[k] = x[k];
    else if (Array.isArray(x[k])) out[k] = x[k].slice(0, 300);
    else out[k] = JSON.parse(JSON.stringify(x[k])).toString?.().slice?.(0, 1000) || '';
  }
  return out;
}
async function hashText(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function ghBase(env) {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${env.LOG_PATH || 'logs/access.jsonl'}`;
}
async function readLogFile(env) {
  const r = await fetch(`${ghBase(env)}?ref=${env.GITHUB_BRANCH || 'main'}`, {
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'info-cbt-log-worker', Accept: 'application/vnd.github+json' }
  });
  if (r.status === 404) return { text: '', sha: null };
  if (!r.ok) throw new Error(`GitHub read failed: ${r.status}`);
  const j = await r.json();
  const text = decodeURIComponent(escape(atob((j.content || '').replace(/\n/g, ''))));
  return { text, sha: j.sha };
}
async function readLogText(env) {
  return (await readLogFile(env)).text;
}
async function appendJsonl(env, obj) {
  // 簡易実装。多数同時アクセス時は競合が起きるため、必要ならQueueやD1等に変更してください。
  for (let attempt = 0; attempt < 3; attempt++) {
    const cur = await readLogFile(env);
    const nextText = cur.text + JSON.stringify(obj) + '\n';
    const body = {
      message: `append access log ${obj.serverTime}`,
      content: btoa(unescape(encodeURIComponent(nextText))),
      branch: env.GITHUB_BRANCH || 'main'
    };
    if (cur.sha) body.sha = cur.sha;
    const r = await fetch(ghBase(env), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'info-cbt-log-worker', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.ok) return;
    if (r.status !== 409) throw new Error(`GitHub write failed: ${r.status} ${await r.text()}`);
  }
  throw new Error('GitHub write conflict; retry later');
}
