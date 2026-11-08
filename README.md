# 病棟アプリ（ward-apps）

自分の端末でオフライン利用するための病棟アプリ置き場です。GitHub Pages で公開し、各端末のホーム画面に追加して使います。

## 構成

```
ward-apps/
├─ index.html            … アプリ一覧（入口）
├─ dm/                   … 糖尿病治療ナビ
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ sw.js              … オフライン用（更新時は VERSION を変える）
│  ├─ icon-192.png / icon-512.png / apple-touch-icon.png
├─ dementia/             … 認知症外来ナビ
├─ htn/                  … 高血圧治療ナビ
├─ lipid/                … 脂質異常症治療ナビ
├─ loc/                  … 神経病巣局在ナビ
├─ nih/                  … NIHSS評価
├─ referral/             … 脳神経クリニック紹介先検索
└─ updrs/                … MDS-UPDRS 評価ツール（各フォルダは dm/ と同じ構成）
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
- 入口の index.html は複数の作業から同時に上書きすると行が消えることがあります。更新前に最新版を取得し、アップロード後に全アプリの行が残っているか確認してください。
- MDS-UPDRS 評価ツール（updrs/）には判定基準の本文を含めていません。判定基準は手元の JSON を各端末のアプリ内で読み込み、その端末にだけ保存します。JSON はこのリポジトリに置かないでください。

## 1つのPWAに統合（2026-11-08〜）
同じドメイン（supernova55md-creator.github.io）に複数のPWAを置くと、Android の Chrome で2つ目以降が「すでにインストールされています」→「アプリを開けませんでした」となるため、ward-apps 全体を1つのPWA「病棟アプリ」にまとめた。

- インストールするのは入口（/ward-apps/）の1つだけ。manifest.webmanifest・sw.js・アイコンは直下にある。
- Android：入口を開いて Chrome のメニュー →「アプリをインストール」。アイコン長押しで各アプリへのショートカット（manifest の shortcuts）。
- iPhone：各アプリを開いて 共有 →「ホーム画面に追加」で、アプリごとのアイコンも作れる（各アプリの apple-touch-icon を使う）。
- 各アプリの index.html には manifest へのリンクを置かない。service worker は直下の ../sw.js を scope "../" で登録する。
- 各アプリの sw.js は廃止用（古い登録とキャッシュを消して自分を解除するだけ）。消さずに残しておく。

### 新しいアプリを足すとき
1. <slug>/ に index.html とアイコン3つ（icon-192.png・icon-512.png・apple-touch-icon.png）を置く。manifest へのリンクは入れない。service worker は register("../sw.js",{scope:"../"}) で登録する。
2. 直下の index.html の <ul> に1行追加。
3. 直下の manifest.webmanifest の shortcuts に1件追加。
4. 直下の sw.js の APPS に slug を足し、VERSION を変える。

### アプリを更新したとき
- 直下の sw.js の VERSION を必ず変える（各アプリの sw.js ではない）。
- 入口の index.html・sw.js・manifest は1つの会話でまとめて更新する（複数の会話で同時に上書きすると行が消える）。
