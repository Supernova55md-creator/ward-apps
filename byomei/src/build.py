#!/usr/bin/env python3
"""病名登録アシスト（byomei）を組み立てる。
使い方: python3 byomei/src/build.py [版]
  src/drugs.txt（薬→病名の辞書）と src/template.html から byomei/index.html を作る。
  共通ブロック（wc-sum・wc-clear）は iken/index.html から取り、KEYS とヘッダーのセレクタだけ書き換える。
"""
import json, os, re, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
ROOT = os.path.dirname(APP)
VERSION = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().isoformat()

drugs, ids = [], set()
for ln, line in enumerate(open(os.path.join(HERE, "drugs.txt"), encoding="utf-8"), 1):
    line = line.rstrip("\n").strip()
    if not line or line.startswith("#"):
        continue
    f = [x.strip() for x in line.split("|")]
    while len(f) < 6:
        f.append("")
    cat, g, brands, dz, note, alias = f[:6]
    assert g and dz, "line %d" % ln
    assert g not in ids, "dup %s (line %d)" % (g, ln)
    ids.add(g)
    dl = []
    for z in dz.split(";"):
        z = z.strip()
        if not z:
            continue
        n, _, t = z.partition("=")
        dl.append({"n": n.strip(), "t": t.strip()})
    drugs.append({"id": g, "c": cat, "g": g,
                  "b": [b.strip() for b in brands.split(",") if b.strip()],
                  "dz": dl, "nt": note,
                  "a": [a.strip() for a in alias.split(",") if a.strip()]})

src = open(os.path.join(ROOT, "iken", "index.html"), encoding="utf-8").read()
blk = re.search(r"<!-- wc-sum:start.*?<!-- wc-clear:end -->", src, re.S).group(0)
blk = blk.replace('var KEYS=["iken-nav-v2"];', 'var KEYS=["byomei-v1"];')
assert 'var KEYS=["byomei-v1"];' in blk

tpl = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
data = json.dumps(drugs, ensure_ascii=False, separators=(",", ":"))
assert "</script" not in data.lower()
html = tpl.replace("__DATA__", data).replace("__VERSION__", VERSION).replace("__WCBLOCKS__", blk)
open(os.path.join(APP, "index.html"), "w", encoding="utf-8").write(html)
print("byomei/index.html", len(html), "bytes,", len(drugs), "drugs, version", VERSION)
