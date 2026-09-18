# mining-hp

ALTAN KHULEG RESOURCES LLC のコーポレートサイト（静的サイト・ビルド不要）。

- 公開ディレクトリ: `docs/`（GitHub Pages 用）
- ローカル確認: `python3 -m http.server -d docs 8080` → http://localhost:8080

## 多言語構成（JA / EN / MN）
言語ごとに独立した静的ページを用意（JS での文言切り替えではなく、`lang` 属性・
hreflang・SEO を正しく分離するため）:

| 言語 | パス | 備考 |
|---|---|---|
| 日本語（基準） | `docs/index.html` | 内容の正本。他言語はこのページを翻訳したもの |
| 英語 | `docs/en/index.html` | — |
| モンゴル語 | `docs/mn/index.html` | ⚠️ 現状は下訳（機械翻訳＋簡易チェック）。**公開前に必ずネイティブ校正が必要** |

- `en/` `mn/` はサイトルートから 1 階層深いため、アセットパスはルート相対（`/styles.css` 等）。
  ルートの `index.html` のみ相対パス（`styles.css` 等）。
- 各ページの `<header>` に JA/EN/MN の `.lang-switch` を設置、`hreflang` alternate リンクも3言語分設定済み。
- `script.js` の `I18N` オブジェクトに、JS が生成する動的文言（モバイルメニューの aria-label 等）の
  3言語分を集約。
- `bin/check-cjk.py` — 日本語ページの簡体字混入チェックに加え、`docs/mn/` 配下は
  ラテン文字とキリル文字が同じ単語内に混在していないかもチェックする
  （コミット前に実行推奨: `python3 bin/check-cjk.py`）。
- モンゴル語ページは Cinzel / Shippori Mincho / Noto Sans JP が Cyrillic（特に Өө／Үю）を
  カバーしないため、`html[lang="mn"]` スコープで自社ホスティングの Noto Serif に
  差し替えている（`styles.css` 冒頭のフォントトークン参照）。

## ページ構成（全セクションが独立ページ）
トップページに残るのは HERO・EXPLORE（7ページへの案内ハブ）・CONTACT・COMPANY のみ。
ABOUT / STRENGTHS / LEADERSHIP / VISION / BASES / BUSINESS / RESOURCES の7セクションは
すべて言語ごとに独立したページとして分離済み（社長の意向：現状コンテンツは薄いが、
今後随時追加していく前提で先に構成を分けた）：

| ページ | JA | EN | MN |
|---|---|---|---|
| トップ | `docs/index.html` | `docs/en/index.html` | `docs/mn/index.html` |
| 会社紹介 | `docs/about/index.html` | `docs/en/about/index.html` | `docs/mn/about/index.html` |
| 強み | `docs/strengths/index.html` | `docs/en/strengths/index.html` | `docs/mn/strengths/index.html` |
| 経営体制 | `docs/leadership/index.html` | `docs/en/leadership/index.html` | `docs/mn/leadership/index.html` |
| ビジョン | `docs/vision/index.html` | `docs/en/vision/index.html` | `docs/mn/vision/index.html` |
| 拠点 | `docs/bases/index.html` | `docs/en/bases/index.html` | `docs/mn/bases/index.html` |
| 事業内容 | `docs/business/index.html` | `docs/en/business/index.html` | `docs/mn/business/index.html` |
| 取扱資源 | `docs/resources/index.html` | `docs/en/resources/index.html` | `docs/mn/resources/index.html` |

- 事業内容ページには「OUR PROCESS」（旧トップページの調達フロー図）も統合し、
  モンゴルの鉱山会社 → 買付・品質管理 → 輸出手配 → 販売 → 日本のお客様、と
  誰が何をするかを明示する形に書き直した（旧フローは抽象的すぎたため）。
- 各サブページの見出し直下に `<h1 class="sr-only">`（視覚的には非表示、AT向け）を設置。
  既存の `.section-title`（h2）を h1 に格上げすると、カードグリッドの h3 が直後に続く
  ページで見出しレベルが飛ぶ（h1→h3）ため、この方式を採用。
- 全サブページのヘッダー nav・footer nav は7ページ共通のフルページ形式
  （`/about/` 等のルート相対パス、`#` アンカー混在なし）に統一済み。
  トップページ自身の nav のみ相対パス（`about/` 等）。
- 各サブページ末尾に相互リンク（`.quiet-link`、控えめな「〜を見る ▷」形式）を設置。
- トップページの EXPLORE セクション（7カードのハブ）・footer nav・nav の各リンクは
  すべて該当ページへのパスに変更済み（旧 `#about`/`#business` 等のアンカーは廃止）。

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
