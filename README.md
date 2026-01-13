# OSC Controller & WebSocket Server

Electron、React、TypeScriptで構築された、OSCメッセージ送信およびWebSocket-OSCブリッジ機能を持つデスクトップアプリケーションです。
外部アプリケーション（TouchDesigner, Max/MSP, Unityなど）との連携を想定して設計されています。

## 主な機能

### 1. マルチターゲットOSC送信
2つの異なる宛先（App1, App2）に対して独立してOSCメッセージを送信できます。

- **App1**: デフォルト Port 9000
- **App2**: デフォルト Port 10000
- **IPアドレス**: 現状は `127.0.0.1` 固定

### 2. WebSocket - OSC ブリッジ
WebSocket経由でJSONメッセージを受信し、それを解析してOSCメッセージとして転送します。
受信したアドレスのプレフィックスに応じて、送信先を自動的に振り分けます。

### 3. 直感的なUI
- アプリケーションごとの独立したポート設定
- ワンクリックでシーン切り替えテストができるボタン（App1-1 ~ App1-6, App2-1 ~ App2-6）
- WebSocketサーバーのポート設定とリアルタイムログ表示

---

## 起動方法

### 必要な環境
- Node.js (推奨 v18以上)
- pnpm (または npm/yarn)

### インストール

```bash
pnpm install
```

### 開発モードでの起動
ElectronアプリとReactのホットリロード環境を立ち上げます。

```bash
pnpm dev:electron
```

### ビルド（プロダクション用）
OSごとの実行可能ファイルを生成します。

```bash
# Mac (DMG / App)
pnpm build:electron
```

出力先: `dist`

---

## 使い方

### 1. 手動でのOSC送信
画面上の「OSC Sender」セクションを使用します。

1. **Target Port** を確認・変更します（エンターキーまたはフォーカスアウトで確定）。
2. **App1-x** や **App2-x** ボタンをクリックします。
3. 指定されたポートへ `/scene [番号]` というOSCメッセージが送信されます。

### 2. WebSocket経由での制御
外部アプリからWebSocketでJSONを送信することで、OSCをトリガーできます。

**サーバー仕様:**
- プロトコル: `ws://`
- ホスト: `localhost` (またはローカルIP)
- デフォルトポート: `8080` (UIで変更可能)

**メッセージフォーマット (JSON):**

```json
{
  "address": "/app1/scene",
  "args": [1, "test"]
}
```

- `address`: 文字列。振り分け用プレフィックスを含めます。
- `args`: 配列。送信する引数（数値または文字列）。

**ルーティング（振り分け）ルール:**

| プレフィックス | 動作 | 変換後のOSCアドレス | 送信先 |
|--------------|------|-------------------|-------|
| `/app1` | App1へ転送 | `/app1` を削除 | Port 9000 (設定可) |
| `/app2` | App2へ転送 | `/app2` を削除 | Port 10000 (設定可) |
| その他 | App1へ転送 | そのまま | Port 9000 (設定可) |

**例:**
- 受信: `{"address": "/app1/scene", "args": [1]}`
  - **送信**: アドレス `/scene`, 引数 `[1]` を **App1** へ
- 受信: `{"address": "/app2/color", "args": ["red"]}`
  - **送信**: アドレス `/color`, 引数 `["red"]` を **App2** へ

---

## 技術スタック

- **Core**: [Electron](https://www.electronjs.org/), [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Communication**: 
  - [node-osc](https://github.com/MylesBorins/node-osc) (OSC Client)
  - [ws](https://github.com/websockets/ws) (WebSocket Server)
- **Styling**: Sass (`.sass`)
- **Build**: electron-vite

## プロジェクト構成

```
src/
├── main/                 # Electron メインプロセス
│   ├── index.ts          # エントリーポイント & IPCハンドリング
│   └── services/         # バックエンドロジック
│       ├── OscService.ts       # OSC送信処理
│       └── WebSocketService.ts # WebSocketサーバー & ブリッジ処理
│
├── preload/              # プリロードスクリプト (IPC通信の定義)
│   └── index.ts
│
├── renderer/             # React レンダラープロセス
│   ├── components/       # UIコンポーネント (OscControlPanel等)
│   ├── hooks/            # ロジックフック (useOscControl等)
│   ├── pages/            # ページコンポーネント
│   └── main.tsx          # Reactエントリーポイント
│
├── types/                # 型定義
│   ├── electron.d.ts     # Windowインターフェース拡張
│   └── osc.ts            # OSC/WS関連の共通型
│
└── constants/            # 定数定義
    └── config.ts         # ポート番号やプレフィックス設定
```

## 開発者向けメモ

### IPC通信設計
レンダラー（React）とメイン（Electron）は `window.electronAPI` を介して通信します。

- `sendOsc`: レンダラーからOSC送信を要求
- `setPort`: ターゲットを指定してポート変更を要求
- `setWsPort`: WebSocketサーバーのポート変更を要求
- `onWsLog`: メインプロセスからのサーバーログを受信

### リファクタリング方針
- **ビューとロジックの分離**: Reactコンポーネントは表示に専念し、ロジックはカスタムフック（`src/hooks`）に分離しています。
- **設定の一元化**: ポート番号やプレフィックスなどの定数は `src/constants/config.ts` で管理しています。
