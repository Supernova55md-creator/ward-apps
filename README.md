# 病棟アプリ（ward-apps）

自分の端末でオフライン利用するための病棟アプリ置き場です。GitHub Pages で公開し、各端末のホーム画面に追加して使います。

## 構成

```
ward-apps/
├─ index.html            … アプリ一覧（入口）
└─ dm/                   … 糖尿病治療ナビ
   ├─ index.html
   ├─ manifest.webmanifest
   ├─ sw.js              … オフライン用（更新時は VERSION を変える）
   ├─ icon-192.png / icon-512.png / apple-touch-icon.png
```

アプリを増やすときは `dm/` と同じ形のフォルダ（例：`htn/`、`lipid/`）を作り、`index.html` の一覧に1行追加します。

## 初回の公開手順（Mac のブラウザで約10分）

1. GitHub にログインし、右上「＋」→「New repository」
   - Repository name：`ward-apps`（推測されにくい名前でも可）
   - **Public** を選ぶ（無料プランの GitHub Pages は公開リポジトリが必要）
   - 「Create repository」
2. 作成直後の画面の「uploading an existing file」をクリック
3. この zip を展開した **ward-apps フォルダの中身**（`index.html` と `dm` フォルダ）をドラッグ＆ドロップ →「Commit changes」
4. リポジトリの「Settings」→ 左メニュー「Pages」
   - Source：「Deploy from a branch」
   - Branch：`main` ／ `/(root)` →「Save」
5. 1〜2分待つと `https://<GitHubのユーザー名>.github.io/ward-apps/` で開けるようになる

## 端末への追加

- **iPhone / iPad（Safari）**：`…/ward-apps/dm/` を開く → 共有ボタン →「ホーム画面に追加」
- **Galaxy（Chrome）**：同じURLを開く → 右上メニュー →「ホーム画面に追加」（または「アプリをインストール」）
- 追加後に一度アイコンから開けば、以後は通信なしで動きます。

## 更新するとき

1. 新しい `dm/index.html` を GitHub で上書きアップロード
2. `dm/sw.js` の `VERSION` を変える（例：`dm-2026-11-08a` → `dm-2026-11-15a`）
3. 端末でアプリを1回開く（通信あり）→ 「新しい版を取り込みました」と出たら、次に開いたときから新しい版

## 注意

- 入力データは各端末のアプリ内（ブラウザ領域）だけに保存され、GitHub には送られません。iPhone ではホーム画面のアプリと Safari のデータは別です。
- 公開リポジトリなので、URL を知っている人は誰でも画面を開けます（検索エンジンには載らない設定）。自分用の利用にとどめ、他の人に配る場合は医療機器プログラム該当性の確認が必要です。
- 写真から読み込む機能は claude.ai 上の版だけで動き、この版には表示されません。
