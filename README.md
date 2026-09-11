# mining-hp

ALTAN KHULEG RESOURCES LLC のコーポレートサイト（静的サイト・ビルド不要）。

- 公開ディレクトリ: `docs/`（GitHub Pages 用）
- ローカル確認: `python3 -m http.server -d docs 8080` → http://localhost:8080

## 素材
デザイン元データ・ロゴ・会社概要・名刺は `source/` を参照（社内資料・非公開）。

## 配色
A案（白ベース・商社型／ネイビー×ウォームホワイト）で確定。`styles.css` の `:root` トークンに直書き。
A/B/C比較用に使っていた `palette-a/b/c.html`・`compare.html`・`palettes.css` は役目を終えたため削除済み（必要なら git 履歴から復元可）。

## SEO / 公開準備
- 全 HTML は現在 `noindex,nofollow`（`index.html` の該当 meta を外すとインデックス開始）
- `docs/robots.txt` / `docs/sitemap.xml` / `index.html` の Organization JSON-LD / OGP（`docs/assets/ogp.png` 1200×630）を用意済み
- 本番 URL はすべて `https://PRODUCTION-DOMAIN.example` のプレースホルダー。
  ドメイン確定後 **`bin/set-site-url.sh <URL>`** で一括置換
- 詳細は [`DEPLOY.md`](DEPLOY.md)
