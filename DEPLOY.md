# 本番公開手順

`docs/` を GitHub Pages 等で配信する静的サイト。ビルド不要。

---

## 1. ドメインを設定する（唯一の必須作業）

サイト URL はすべて **プレースホルダー `https://PRODUCTION-DOMAIN.example`** で入っている。
ドメイン確定後、次の 1 コマンドで全ファイルを一括置換する：

```bash
bin/set-site-url.sh https://www.example.com
```

置換対象（`docs/` 配下）:

| ファイル | 箇所 |
|---|---|
| `index.html` | `<link rel="canonical">` / `og:url` / `og:image` / `twitter:image` / JSON-LD (`url`, `logo`, `image`) |
| `sitemap.xml` | `<loc>` |
| `robots.txt` | `Sitemap:` |

実行後 `git diff` で確認してコミット。

---

## 2. 検索インデックスを開始する（公開の準備が整ってから）

現在は全 HTML の `<head>` に

```html
<meta name="robots" content="noindex,nofollow">
```

が入っており、クロールされてもインデックスされない。
インデックスを開始するときは **`index.html` のこの 1 行だけを削除**する。

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
