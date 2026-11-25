"""tools/karte.py から呼ばれる：カルテ端末版に文字認識（Tesseract.js 本体・コア・日本語モデル）を内蔵する。
院内のファイルサーバー（file://）では通信も外部ファイル読み込みもできないため、すべてを1つのHTMLに入れる。
コアは SIMD 非対応のブラウザでも動く版（tesseract-core-lstm）を使う。"""
import base64, os

def hook(html, app):
    o = os.path.join(app, "ocr")
    rd = lambda f: open(os.path.join(o, f), encoding="utf-8").read()
    main, wk, core = rd("tesseract.min.js"), rd("worker.min.js"), rd("tesseract-core-lstm.wasm.js")
    for x in (main, wk, core):
        assert "</script" not in x.lower()
    jpn = base64.b64encode(open(os.path.join(o, "jpn.traineddata.gz"), "rb").read()).decode()
    emb = ("<!-- 文字認識：Tesseract.js（Apache License 2.0）・tesseract.js-core・tessdata jpn（best_int） -->\n"
           "<script>\n" + main + "\n</script>\n"
           '<script type="text/plain" id="ocr-core">' + core + "</script>\n"
           '<script type="text/plain" id="ocr-worker">' + wk + "</script>\n"
           '<script type="text/plain" id="ocr-jpn">' + jpn + "</script>\n")
    assert "<!--karte-ocr-->" in html
    return html.replace("<!--karte-ocr-->", emb, 1)
