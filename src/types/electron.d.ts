// Electron APIの型定義
// プリロードスクリプトでexposeInMainWorldしたAPIの型

export interface ElectronAPI {
  // プラットフォーム情報
  platform: NodeJS.Platform

  // バージョン情報
  versions: {
    node: string
    chrome: string
    electron: string
  }

  // OSCメッセージを送信
  sendOsc: (address: string, ...args: (string | number)[]) => Promise<{
    success: boolean
    address: string
    args: (string | number)[]
  }>
}

// グローバルwindowオブジェクトにelectronAPIを追加
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
