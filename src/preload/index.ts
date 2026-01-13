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
  sendOsc: (address: string, args: (string | number)[], target: 'app1' | 'app2' = 'app1') => {
    return ipcRenderer.invoke('osc:send', address, args, target)
  },

  // OSCポートを変更
  setPort: (port: number, target: 'app1' | 'app2') => {
    return ipcRenderer.invoke('osc:set-port', port, target)
  },

  // WebSocketポートを変更
  setWsPort: (port: number) => {
    return ipcRenderer.invoke('ws:set-port', port)
  },

  // WebSocketログを受信
  onWsLog: (callback: (message: string) => void) => {
    ipcRenderer.on('ws:log', (_event, message) => callback(message))
  },
}

// contextBridgeを使ってレンダラーに安全にAPIを公開
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScriptの型定義
export type ElectronAPI = typeof electronAPI
