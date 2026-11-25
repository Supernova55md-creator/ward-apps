#!/usr/bin/env python3
"""図などを内蔵した個人用のカルテ端末版を、パスワード付きHTMLにするための「作成ツール」を作る。

使い方: python3 tools/lock/make_builder.py <カルテ端末版.html> <内蔵するJSON> <変数名> <出力ファイル名> <作成ツールの出力先.html>
  例:   python3 tools/lock/make_builder.py /tmp/karte/MMTナビ.html mmt-figs.json __MMT_FIGS__ 08_MMTナビ_ver1_2026-11-25a.html /tmp/MMTナビ図入り_作成ツール.html

- JSON を window.<変数名> として </head> 直前に埋め込み、gzip する（アプリ側で window.<変数名> を見て内蔵データを使う）。
- 作成ツール（平文の元データ入り）は本人のMacだけで開き、パスワードを入れて暗号化HTML（PBKDF2-SHA256 60万回＋AES-256-GCM）を保存する。
  パスワードは Claude にも渡さない。作成ツールと元データは公開リポジトリ・院内に置かない（Dropbox/Coworks/00_右腕AI など）。
- 出力サイズは決まった値になる（申請書の size に使える）。
"""
import base64, gzip, json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
app, js, var, fname, out = sys.argv[1:6]
html = open(app, encoding="utf-8").read()
data = open(js, encoding="utf-8").read(); json.loads(data)
assert "</script" not in data.lower()
html = html.replace("</head>", "<script>window.%s=%s;</script>\n</head>" % (var, data), 1)
gz = gzip.compress(html.encode("utf-8"), compresslevel=9, mtime=0)
loader = open(os.path.join(D, "loader.html"), encoding="utf-8").read()
t = open(os.path.join(D, "builder_tpl.html"), encoding="utf-8").read()
t = t.replace("__FNAME__", fname).replace("__PAYLOAD__", base64.b64encode(gz).decode()).replace(
    "__LOADER__", json.dumps(loader, ensure_ascii=False).replace("</", "<\\/"))
open(out, "w", encoding="utf-8").write(t)
size = len(loader.encode("utf-8")) - len("__SALT____IV____CT__") + 24 + 16 + 4 * ((len(gz) + 16 + 2) // 3)
print("作成ツール", out, len(t.encode()), "bytes / 暗号化HTMLのサイズ", size, "bytes")
