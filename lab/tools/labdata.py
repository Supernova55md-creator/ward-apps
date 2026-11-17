#!/usr/bin/env python3
"""外注・研究検査ナビ（lab）のデータファイル lab/data.enc を扱う道具。

  解読:   python3 labdata.py decrypt <data.enc> <out.json>      （パスフレーズは環境変数 LAB_PASS）
  暗号化: python3 labdata.py encrypt <in.json> <data.enc>       （既存 data.enc の salt を引き継ぐ）

salt を変えないので、端末に記憶された鍵のまま新しい data.enc を自動で取り込める
（アプリ起動時の autoUpd）。IV は毎回ランダム。形式は AES-256-GCM／PBKDF2-SHA256 60万回。
in.json は {"title","updated","siteUpdate","rows":[...]} の形。
"""
import base64, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


def key(pw, salt, it):
    return PBKDF2HMAC(hashes.SHA256(), 32, salt, it).derive(pw.encode())


def main():
    pw = os.environ.get("LAB_PASS")
    if not pw or len(sys.argv) != 4:
        sys.exit(__doc__)
    cmd, src, dst = sys.argv[1:]
    if cmd == "decrypt":
        e = json.load(open(src))
        pt = AESGCM(key(pw, base64.b64decode(e["salt"]), e["it"])).decrypt(base64.b64decode(e["iv"]), base64.b64decode(e["ct"]), None)
        open(dst, "w").write(json.dumps(json.loads(pt), ensure_ascii=False, indent=1))
    elif cmd == "encrypt":
        old = json.load(open(dst))
        salt, it = base64.b64decode(old["salt"]), old["it"]
        payload = json.load(open(src))
        assert isinstance(payload.get("rows"), list) and payload["rows"], "rows がない"
        iv = os.urandom(12)
        ct = AESGCM(key(pw, salt, it)).encrypt(iv, json.dumps(payload, ensure_ascii=False).encode(), None)
        out = {"v": 1, "app": "lab", "kdf": "PBKDF2-SHA256", "it": it, "salt": old["salt"],
               "iv": base64.b64encode(iv).decode(), "ct": base64.b64encode(ct).decode()}
        json.dump(out, open(dst, "w"))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
