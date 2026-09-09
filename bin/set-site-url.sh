#!/usr/bin/env bash
# ------------------------------------------------------------------
# 本番ドメインを一括設定する唯一のスクリプト。
#
#   bin/set-site-url.sh https://www.example.com
#
# docs/ 配下の全ファイルの
#   https://PRODUCTION-DOMAIN.example
# を、指定した URL（末尾スラッシュは自動で除去）に置換します。
# 対象: canonical / og:url / og:image / twitter:image / JSON-LD /
#       sitemap.xml / robots.txt
#
# 冪等ではありません（プレースホルダーが残っている場合のみ実行してください）。
# 変更後は git diff で確認してからコミットしてください。
# ------------------------------------------------------------------
set -euo pipefail

PLACEHOLDER="https://PRODUCTION-DOMAIN.example"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS="$ROOT/docs"

if [ $# -ne 1 ]; then
  echo "usage: $0 <site-url>   e.g. $0 https://www.altankhuleg-r.com" >&2
  exit 1
fi

URL="${1%/}"   # strip trailing slash
case "$URL" in
  https://*|http://*) ;;
  *) echo "error: URL must start with http:// or https:// (got: $URL)" >&2; exit 1 ;;
esac

matches="$(grep -rl --binary-files=without-match "$PLACEHOLDER" "$DOCS" || true)"
if [ -z "$matches" ]; then
  echo "no placeholder found under docs/ — nothing to do (already set?)"
  exit 0
fi

echo "Replacing"
echo "  $PLACEHOLDER"
echo "-> $URL"
echo "in:"
echo "$matches" | sed "s|^|  |"

echo "$matches" | while IFS= read -r f; do
  # BSD/GNU sed compatible in-place edit
  perl -pi -e "s{\Q$PLACEHOLDER\E}{$URL}g" "$f"
done

echo
echo "done. Review with: git -C \"$ROOT\" diff"
