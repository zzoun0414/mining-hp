#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check-cjk.py — 日本語テキストに中国語簡体字の字形が紛れ込んでいないかを検査する。

背景:
  AI 翻訳・生成では、Unicode 上は別のコードポイントを持つ「日本語の正字」と
  「中国語簡体字」を取り違えることがある（例: 経営 を 经营 と書いてしまう）。
  見た目が漢字っぽいので校正時に見逃しやすく、ネイティブが見ると一目で分かる
  ミスになる。このスクリプトはよくある簡体字だけの字形をブラックリスト化し、
  対象ファイルに出現していないかを機械的にチェックする（完全網羅ではない —
  最終確認はネイティブ校正に置き換わるものではない）。

使い方:
  bin/check-cjk.py                 # docs/*.html を検査
  bin/check-cjk.py docs/en/*.html  # 対象ファイルを指定
  bin/check-cjk.py --list          # チェック対象の字一覧を表示するだけ

終了コード: 見つかった場合は 1、なければ 0（CI/コミット前チェックに使える）。
"""
import sys
import glob

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


def main(argv):
    if '--list' in argv:
        for b, g in TRAPS.items():
            print(f"{b} -> {g}")
        return 0

    targets = [a for a in argv if not a.startswith('-')]
    if not targets:
        targets = sorted(glob.glob('docs/*.html'))
    if not targets:
        print("対象ファイルが見つかりません（docs/*.html が無い場合はパスを指定してください）", file=sys.stderr)
        return 2

    hits = check(targets)
    if not hits:
        print(f"OK: {len(targets)} 件のファイルに簡体字専用の字形は見つかりませんでした。")
        return 0

    print("NG: 簡体字専用の字形が見つかりました（要確認）:\n")
    for path, found in hits.items():
        print(f"  {path}")
        for bad, good, n in found:
            print(f"    {bad}（正: {good}）x{n}")
    print("\n※ これは既知の紛らわしい字のブラックリストによる簡易検査です。")
    print("  検出ゼロでもネイティブ校正の代わりにはなりません。")
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
