# mining-hp

ALTAN KHULEG RESOURCES LLC のコーポレートサイト（静的サイト）。

- 公開ディレクトリ: `docs/`（GitHub Pages 用）
- ローカル確認: `python3 -m http.server -d docs 8080` → http://localhost:8080

## 素材
デザイン元データ・ロゴ・会社概要は `source/` を参照。

## 配色プレビュー
レイアウト共通・色のみ差し替えた3案。`docs/` を配信して各ファイルを開く。
- `palette-a.html` — A：白ベース・商社型（ネイビー×ウォームホワイト）
- `palette-b.html` — B：墨黒・現行改良（クールチャコール）
- `palette-c.html` — C：蛍石ベース（スレート×フローライト・バイオレット）

配色は `styles.css`（トークン定義）＋ `palettes.css`（`html[data-palette]` で切替）で管理。
