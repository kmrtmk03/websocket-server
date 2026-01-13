/**
 * Electron API型定義
 * 
 * プリロードスクリプトで `contextBridge.exposeInMainWorld` により
 * 公開されたAPIの型定義です。
 */

import type { OscTarget, OscSendResult, PortChangeResult } from './osc'

/**
 * レンダラープロセスからアクセス可能なElectron API
 */
export interface ElectronAPI {
  // =========================================================================
  // システム情報
  // =========================================================================

  /** 実行プラットフォーム */
  platform: NodeJS.Platform

  /** バージョン情報 */
  versions: {
    node: string
    chrome: string
    electron: string
  }

  // =========================================================================
  // OSC操作
  // =========================================================================

  /**
   * OSCメッセージを送信
   * @param address OSCアドレス（例: /scene）
   * @param args 引数の配列
   * @param target 送信先ターゲット（省略時: app1）
   */
  sendOsc: (address: string, args: (string | number)[], target?: OscTarget) => Promise<OscSendResult>

  /**
   * OSCポートを変更
   * @param port 新しいポート番号
   * @param target 対象ターゲット
   */
  setPort: (port: number, target: OscTarget) => Promise<PortChangeResult>

  // =========================================================================
  // WebSocket操作
  // =========================================================================

  /**
   * WebSocketサーバーのポートを変更
   * @param port 新しいポート番号
   */
  setWsPort: (port: number) => Promise<PortChangeResult>

  /**
   * WebSocketログを受信するリスナーを登録
   * @param callback ログメッセージを受け取るコールバック
   */
  onWsLog: (callback: (message: string) => void) => void
}

/**
 * グローバルwindowオブジェクトの型拡張
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
