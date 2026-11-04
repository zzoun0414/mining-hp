#!/usr/bin/env bash
# ------------------------------------------------------------------
# styles.css のキャッシュバスター（?v=N）を一括更新するスクリプト。
#
#   bin/bump-css-version.sh
#
# 引数なしで実行すると、現在のバージョン番号を自動で +1 して
# docs/ 配下の全 HTML の styles.css 参照に反映します。
# （href="styles.css" / href="/styles.css" どちらの形でも対応）
#
# なぜ必要か: ホスティング側が styles.css に7日間のブラウザキャッシュを
# 設定しているため（cache-control: max-age=604800、こちら側の設定では
# なくホスト側のデフォルト）、CSS を変更してサーバーに上げても、既に
# 一度そのページを開いたことのあるブラウザには古い styles.css が
# 残り続け、「HTML は新しいのに見た目が変わっていない」という状態に
# なる。?v=N をURLに付けることで、Nが変わるたびに別ファイル扱いとなり
# 強制的に再取得される。
#
# 使い方: styles.css を編集したら、FTPで上げる前にこのスクリプトを
# 実行してから、docs/*.html と docs/styles.css の両方をアップロード
# すること。
# ------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS="$ROOT/docs"

# 現在のバージョン番号を検出（見つからなければ 1 から開始）
CURRENT=$(grep -rhoE 'styles\.css\?v=[0-9]+' "$DOCS" --include="*.html" | head -1 | grep -oE '[0-9]+$' || echo "0")
NEW=$((CURRENT + 1))

echo "styles.css キャッシュバージョン: $CURRENT -> $NEW"

find "$DOCS" -name "*.html" -print0 | while IFS= read -r -d '' f; do
  sed -i '' -E "s#(href=\"/?styles\.css)(\?v=[0-9]+)?\"#\1?v=$NEW\"#g" "$f"
done

echo "完了。変更を git diff で確認してからコミット・アップロードしてください。"
