# 本番公開手順

`docs/` を GitHub Pages 等で配信する静的サイト。ビルド不要。

---

## 1. ドメインを設定する（唯一の必須作業）

サイト URL はすべて **プレースホルダー `https://PRODUCTION-DOMAIN.example`** で入っている。
ドメイン確定後、次の 1 コマンドで全ファイルを一括置換する：

```bash
bin/set-site-url.sh https://www.example.com
```

置換対象（`docs/` 配下、`grep -rl` で自動検出するので JA/EN/MN 全ページが対象）:

| ファイル | 箇所 |
|---|---|
| 全9ページ（JA/EN/MN × トップ・事業内容・取扱資源） | `<link rel="canonical">` / hreflang alternate / `og:url` / `og:image` / `twitter:image` / JSON-LD (`url`, `logo`, `image`) |
| `sitemap.xml` | `<loc>` |
| `robots.txt` | `Sitemap:` |

実行後 `git diff` で確認してコミット。

---

## 2. 検索インデックスを開始する（公開の準備が整ってから）

現在は全 HTML（JA/EN/MN 全ページ）の `<head>` に

```html
<meta name="robots" content="noindex,nofollow">
```

が入っており、クロールされてもインデックスされない。
インデックスを開始するときは **各ページのこの 1 行を削除**する。

**`docs/mn/index.html` は現状ドラフト機械翻訳**（`bin/check-cjk.py` によるラテン／
キリル文字混在チェックのみ通過済み、文意・自然さの校正は未実施）。
モンゴル語ネイティブ校正が完了するまでは、この行を残して他言語だけ先にインデックス
を開始することもできる（ページごとに独立しているため）。

---

## 3. OGP 画像

`docs/assets/ogp.png`（1200×630）はブランド既定のプレースホルダー。
写真ベースの差し替えを行う場合は同じパス・同じ寸法で上書きするだけでよい。

---

## 4. 公開後の確認

- `https://<domain>/sitemap.xml` / `https://<domain>/robots.txt` が 200 で返るか
- Google Search Console にサイトを登録し、sitemap を送信
- OGP: [Facebook Sharing Debugger] / [X Card Validator] でカード表示を確認
- 構造化データ: [Google Rich Results Test] で `index.html` の Organization を検証

[Facebook Sharing Debugger]: https://developers.facebook.com/tools/debug/
[X Card Validator]: https://cards-dev.twitter.com/validator
[Google Rich Results Test]: https://search.google.com/test/rich-results
