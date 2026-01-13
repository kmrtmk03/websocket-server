# Anti Playground (Vite React Template)

このリポジトリは、Vite + React + TypeScript をベースにしたモダンな開発テンプレート兼学習用プレイグラウンドです。
Sass と CSS Modules を利用した堅牢なスタイル管理に加え、アニメーションライブラリやルーティングがセットアップされています。

## 必要な環境

- Node.js: v23.7.0 以上
- パッケージマネージャー: pnpm (推奨) または npm

## 使用技術

- **Core**: Vite 7 / React 19 / TypeScript
- **Styling**: Sass (`.sass`) / CSS Modules
- **Animation**: [Framer Motion](https://www.framer.com/motion/) / [GSAP](https://gsap.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Linting**: ESLint (Flat Config)
- **Utilities**: Sharp (画像処理)

## セットアップ

```bash
# pnpmを使用する場合（推奨）
pnpm install

# npmを使用する場合
npm install
```

## 開発サーバーの起動

```bash
pnpm dev
# または
npm run dev
```

ブラウザで `http://localhost:5173/game` を開きます。（`basename="/game"` が設定されています）

## ビルド

```bash
pnpm build
# または
npm run build
```

出力は `dist` ディレクトリに生成されます。

## プロジェクト構成

```
react-template/
├── src/
│   ├── main.tsx            # エントリーポイント
│   ├── App.tsx             # メインコンポーネント（ルーティング設定）
│   ├── App.sass            # アプリ全体の共通スタイル
│   ├── components/         # 再利用可能なコンポーネント
│   ├── hooks/              # カスタムフック (例: useScrollLock.ts)
│   ├── libs/               # 外部ライブラリのラッパーや共通ユーティリティ (例: TimeUtil.ts)
│   ├── styles/             # グローバルスタイル定義
│   │   ├── reset.sass      # リセットCSS
│   │   ├── mixins/         # Sass mixins (_font.sass, _media-query.sass 等)
│   │   └── variables/      # Sass 変数 (_color.sass, _layout.sass 等)
│   └── global.d.ts         # 型定義
└── tools/                  # 開発補助ツール
    └── imageCompile/       # 高品質な画像圧縮ツール
```

## 開発ツール

### 画像圧縮ツール (`tools/imageCompile`)

Sharp を使用した高品質な画像圧縮ツールが含まれています。

```bash
cd tools/imageCompile
npm install
npm run compress        # 品質70で圧縮
npm run compress:80     # 品質80で圧縮
```

詳細は [`tools/imageCompile/README.md`](tools/imageCompile/README.md) を参照してください。

## 特徴

- **スタイル自動読み込み**: `vite.config.ts` の設定により、すべての Sass ファイルで `mixins` と `variables` が自動的に利用可能です。
- **型安全**: TypeScript をフル活用し、コンポーネントやユーティリティの型安全性を確保しています。
- **リッチなアニメーション**: Framer Motion と GSAP が導入済みで、高度な UI アニメーションを容易に実装できます。
- **ベースパス設定**: React Router に `/game` ベースパスが設定されており、特定のサブディレクトリ配下での動作を想定しています。

## コミットメッセージの提案

`docs: README.md を現在のプロジェクト構成と依存関係に合わせて更新`

