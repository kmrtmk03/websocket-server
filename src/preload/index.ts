import { contextBridge, ipcRenderer } from 'electron'

// レンダラープロセスに公開するAPI
const electronAPI = {
  // プラットフォーム情報
  platform: process.platform,

  // バージョン情報
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // OSCメッセージを送信
  sendOsc: (address: string, ...args: (string | number)[]) => {
    return ipcRenderer.invoke('osc:send', address, ...args)
  },

  // OSCポートを変更
  setPort: (port: number) => {
    return ipcRenderer.invoke('osc:set-port', port)
  },
}

// contextBridgeを使ってレンダラーに安全にAPIを公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScriptの型定義
export type ElectronAPI = typeof electronAPI
