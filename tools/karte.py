#!/usr/bin/env python3
"""病棟ナビのアプリから、カルテ端末（院内共有フォルダ）用の単体HTMLを作る。全アプリ共通。

使い方:  python3 tools/karte.py <slug> [出力フォルダ]
  例:    python3 tools/karte.py setsumei /tmp/karte
出力:   <出力フォルダ>/<アプリの<title>>.html  （既定の出力フォルダは ./karte-dist）

やること:
  - ../profile.js をインライン化（患者プロファイルの帯はそのまま動く。保存先はその端末のブラウザ）
  - ../share.js（QR）を外す（カルテ端末では公開URLのQRは不要）
  - アイコンを data URI にする（ファイル1つで完結させる）
  - service worker の登録は file:// では元のガードで動かないので、そのまま残す
  - 外部ファイルを読む箇所が残っていれば警告する（例：lab/data.enc は別に持ち込む）
  - <slug>/src/karte_hook.py があれば hook(html, app) を呼ぶ（アプリ独自の内蔵処理。例：byomei の文字認識）
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build(slug, outdir):
    app = os.path.join(ROOT, slug)
    html = open(os.path.join(app, "index.html"), encoding="utf-8").read()

    def inline_js(name):
        p = os.path.join(ROOT, name)
        js = open(p, encoding="utf-8").read()
        assert "</script" not in js.lower(), name
        return "<script>\n/* inlined: " + name + " */\n" + js + "\n</script>"

    html = re.sub(r'<script src="\.\./profile\.js"[^>]*></script>', lambda m: inline_js("profile.js"), html)
    html = re.sub(r'<script src="\.\./share\.js"[^>]*></script>\s*', "", html)

    ic = os.path.join(app, "icon-192.png")
    if os.path.exists(ic):
        uri = "data:image/png;base64," + base64.b64encode(open(ic, "rb").read()).decode()
        html = html.replace('href="icon-192.png"', 'href="%s"' % uri).replace('href="apple-touch-icon.png"', 'href="%s"' % uri)
        html = html.replace('src="icon-192.png"', 'src="%s"' % uri)

    # アプリ独自の追加処理（例：byomei は文字認識の部品を内蔵する）：<slug>/src/karte_hook.py の hook(html, app)
    hk = os.path.join(app, "src", "karte_hook.py")
    if os.path.exists(hk):
        import importlib.util
        spec = importlib.util.spec_from_file_location("karte_hook_" + slug, hk)
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        html = mod.hook(html, app)

    html = html.replace("<head>", "<head>\n<!-- カルテ端末（院内共有フォルダ）用 単体版：tools/karte.py で ward-apps/%s から生成 -->" % slug, 1)

    warn = sorted(set(re.findall(r'(?:src|href)="(?!data:|https?:|#|mailto:)([^"]+)"', html)))
    warn += sorted(set(re.findall(r'fetch\(\s*["\']([^"\']+)["\']', html)))
    warn = [w for w in warn if "'" not in w and "+" not in w]
    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    fname = re.sub(r'[\\/:*?"<>|]', "_", title) + ".html"
    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, fname)
    open(out, "w", encoding="utf-8").write(html)
    print("wrote", out, len(html), "bytes")
    if warn:
        print("  注意：外部ファイルを参照している箇所があります（単体では読めない可能性）：", ", ".join(warn))
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    build(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "karte-dist"))
