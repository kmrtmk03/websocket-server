import { contextBridge } from 'electron'

// レンダラープロセスに公開するAPI
// 現時点ではIPC機能は最小限。必要に応じて後で拡張可能
const electronAPI = {
  // プラットフォーム情報
  platform: process.platform,

  // バージョン情報
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // IPC通信のサンプル（将来の拡張用）
  // invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  // on: (channel: string, listener: (...args: unknown[]) => void) => {
  //   ipcRenderer.on(channel, (_event, ...args) => listener(...args))
  // },
}

// contextBridgeを使ってレンダラーに安全にAPIを公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScriptの型定義
export type ElectronAPI = typeof electronAPI
