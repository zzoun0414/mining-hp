# mining-hp

ALTAN KHULEG RESOURCES LLC のコーポレートサイト（静的サイト・ビルド不要）。

- 公開ディレクトリ: `docs/`（GitHub Pages 用）
- ローカル確認: `python3 -m http.server -d docs 8080` → http://localhost:8080

## 素材
デザイン元データ・ロゴ・会社概要・名刺は `source/` を参照（社内資料・非公開）。

## 配色プレビュー
レイアウト共通・色のみ差し替えた3案。`docs/` を配信して各ファイルを開く。
- `palette-a.html` — A：白ベース・商社型（ネイビー×ウォームホワイト）
- `palette-b.html` — B：墨黒・現行改良（クールチャコール）
- `palette-c.html` — C：蛍石ベース（スレート×フローライト・バイオレット）
- `compare.html` — 1ページ上で上部ボタン（A/B/C・キー 1/2/3）から配色を切替。選択は localStorage に保持

配色は `styles.css`（トークン定義）＋ `palettes.css`（`html[data-palette]` で切替）で管理。

## SEO / 公開準備
- 全 HTML は現在 `noindex,nofollow`（`index.html` の該当 meta を外すとインデックス開始）
- `docs/robots.txt` / `docs/sitemap.xml` / `index.html` の Organization JSON-LD / OGP（`docs/assets/ogp.png` 1200×630）を用意済み
- 本番 URL はすべて `https://PRODUCTION-DOMAIN.example` のプレースホルダー。
  ドメイン確定後 **`bin/set-site-url.sh <URL>`** で一括置換
- 詳細は [`DEPLOY.md`](DEPLOY.md)
