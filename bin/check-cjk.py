#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check-cjk.py — スクリプト混在（字形取り違え）の機械チェック。

  1) 日本語ページ: 中国語簡体字専用の字形が紛れ込んでいないか
     （例: 経営 を 经营 と書いてしまう）
  2) モンゴル語ページ（docs/mn/）: 見た目が似たラテン文字とキリル文字が
     同じ単語の中で混在していないか
     （例: жонш の "о" を誤ってラテン文字の "o" で打ってしまう）

  どちらも AI 翻訳・生成にありがちな取り違えで、Unicode 上は別のコード
  ポイントなのに校正時に見逃しやすい。既知パターンのブラックリスト／
  ヒューリスティックによる簡易検査であり、完全網羅ではない —
  最終確認はネイティブ校正に置き換わるものではない。

使い方:
  bin/check-cjk.py                 # docs/*.html + docs/en/*.html + docs/mn/*.html を検査
  bin/check-cjk.py docs/mn/*.html  # 対象ファイルを指定（パスで自動判別）
  bin/check-cjk.py --list          # 簡体字チェック対象の字一覧を表示するだけ

終了コード: 見つかった場合は 1、なければ 0（CI/コミット前チェックに使える）。
"""
import sys
import re
import glob
import os

# 簡体字専用の字形 → 対応する日本語の正字（常用漢字）
# 「国/点/数/体/会/学/万」等、日本語の新字体と偶然一致する字は含めない。
TRAPS = {
    '铁': '鉄', '归': '帰', '应': '応', '对': '対', '头': '頭', '术': '術',
    '长': '長', '门': '門', '问': '問', '间': '間', '业': '業', '产': '産',
    '输': '輸', '贸': '貿', '资': '資', '责': '責', '团': '団', '现': '現',
    '实': '実', '续': '続', '总': '総', '网': '網', '络': '絡', '项': '項',
    '设': '設', '备': '備', '达': '達', '调': '調', '场': '場', '关': '関',
    '际': '際', '检': '検', '认': '認', '确': '確', '说': '説', '让': '譲',
    '广': '広', '华': '華', '经': '経', '营': '営', '为': '為', '动': '動',
    '结': '結', '构': '構', '书': '書', '买': '買', '卖': '売', '价': '価',
    '单': '単', '义': '義', '这': '這', '儿': '児', '时': '時', '类': '類',
    '统': '統', '规': '規', '权': '権', '术': '術', '级': '級', '层': '層',
    '员': '員', '识': '識', '证': '証', '选': '選', '标': '標', '还': '還',
    '难': '難', '预': '預', '导': '導', '压': '圧',
}


def check(paths):
    hits = {}  # path -> [(char, correct, count), ...]
    for path in paths:
        try:
            text = open(path, encoding='utf-8').read()
        except OSError as e:
            print(f"skip {path}: {e}", file=sys.stderr)
            continue
        found = [(b, g, text.count(b)) for b, g in TRAPS.items() if b in text]
        if found:
            hits[path] = found
    return hits


# モンゴル語（キリル文字）ページ用: 見た目が同じラテン文字がキリル文字の
# 単語に混ざっていないかをチェックする。
# 例: жонш の代わりに жоnш（"n" がラテン文字）のように打ってしまうミス。
_WORD_RE = re.compile(r"[^\W\d_]+", re.UNICODE)
_LATIN_RE = re.compile(r"[A-Za-z]")
_CYRILLIC_RE = re.compile(r"[Ѐ-ӿ]")


def check_mongol_script_mixing(paths):
    hits = {}  # path -> [(word, count), ...]
    for path in paths:
        try:
            text = open(path, encoding='utf-8').read()
        except OSError as e:
            print(f"skip {path}: {e}", file=sys.stderr)
            continue
        counts = {}
        for word in _WORD_RE.findall(text):
            if _LATIN_RE.search(word) and _CYRILLIC_RE.search(word):
                counts[word] = counts.get(word, 0) + 1
        if counts:
            hits[path] = sorted(counts.items())
    return hits


def _is_mongol_path(path):
    parts = path.replace('\\', '/').split('/')
    return 'mn' in parts


def main(argv):
    if '--list' in argv:
        for b, g in TRAPS.items():
            print(f"{b} -> {g}")
        return 0

    targets = [a for a in argv if not a.startswith('-')]
    if not targets:
        targets = sorted(glob.glob('docs/*.html') + glob.glob('docs/en/*.html') + glob.glob('docs/mn/*.html'))
    if not targets:
        print("対象ファイルが見つかりません（パスを指定してください）", file=sys.stderr)
        return 2

    jp_targets = [t for t in targets if not _is_mongol_path(t)]
    mn_targets = [t for t in targets if _is_mongol_path(t)]

    ok = True

    if jp_targets:
        hits = check(jp_targets)
        if not hits:
            print(f"OK: {len(jp_targets)} 件のファイルに簡体字専用の字形は見つかりませんでした。")
        else:
            ok = False
            print("NG: 簡体字専用の字形が見つかりました（要確認）:\n")
            for path, found in hits.items():
                print(f"  {path}")
                for bad, good, n in found:
                    print(f"    {bad}（正: {good}）x{n}")

    if mn_targets:
        mhits = check_mongol_script_mixing(mn_targets)
        if not mhits:
            print(f"OK: {len(mn_targets)} 件のファイルにラテン／キリル文字混在の単語は見つかりませんでした。")
        else:
            ok = False
            print("NG: ラテン文字とキリル文字が混在する単語が見つかりました（要確認）:\n")
            for path, found in mhits.items():
                print(f"  {path}")
                for word, n in found:
                    print(f"    {word!r} x{n}")

    print("\n※ これは既知パターンのブラックリスト／ヒューリスティックによる簡易検査です。")
    print("  検出ゼロでもネイティブ校正の代わりにはなりません。")
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
