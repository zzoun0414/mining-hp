#!/usr/bin/env bash
# ------------------------------------------------------------------
# script.js のキャッシュバスター（?v=N）を一括更新するスクリプト。
# bin/bump-css-version.sh の script.js 版。
#
#   bin/bump-js-version.sh
#
# 引数なしで実行すると、現在のバージョン番号を自動で +1 して
# docs/ 配下の全 HTML の script.js 参照に反映します。
# （src="script.js" / src="/script.js" どちらの形でも対応）
#
# なぜ必要か: styles.css と同じ理由（ホスティング側の長期ブラウザ
# キャッシュ）。script.js はこれまで一度もキャッシュバスターが
# 付いておらず、「直したはずなのに古い動きのまま」という報告が
# 実際はブラウザにキャッシュされた古い script.js が原因だった
# 可能性があるため追加（2026-11）。
#
# 使い方: script.js を編集したら、FTPで上げる前にこのスクリプトを
# 実行してから、docs/*.html と docs/script.js の両方をアップロード
# すること。
# ------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS="$ROOT/docs"

CURRENT=$(grep -rhoE 'script\.js\?v=[0-9]+' "$DOCS" --include="*.html" | head -1 | grep -oE '[0-9]+$' || echo "0")
NEW=$((CURRENT + 1))

echo "script.js キャッシュバージョン: $CURRENT -> $NEW"

find "$DOCS" -name "*.html" -print0 | while IFS= read -r -d '' f; do
  sed -i '' -E "s#(src=\"/?script\.js)(\?v=[0-9]+)?\"#\1?v=$NEW\"#g" "$f"
done

echo "完了。変更を git diff で確認してからコミット・アップロードしてください。"
