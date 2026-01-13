/**
 * OSC関連の共通型定義
 * 
 * このファイルはメインプロセスとレンダラープロセスの両方で使用される
 * OSC通信に関する型を一元管理します。
 */

/**
 * OSC送信先のターゲット識別子
 * - app1: メインアプリケーション (デフォルトPort: 9000)
 * - app2: サブアプリケーション (デフォルトPort: 10000)
 */
export type OscTarget = 'app1' | 'app2'

/**
 * WebSocket経由で受信するOSC転送用メッセージのインターフェース
 * 
 * @example
 * {
 *   address: "/app1/scene",
 *   args: [1]
 * }
 */
export interface OscTransferMessage {
  /** OSCアドレス（例: /scene, /app1/scene） */
  address: string
  /** OSCメッセージの引数 */
  args: (string | number)[]
}

/**
 * OSC送信結果のインターフェース
 */
export interface OscSendResult {
  success: boolean
  address?: string
  args?: (string | number)[]
  target?: OscTarget
  error?: string
}

/**
 * ポート変更結果のインターフェース
 */
export interface PortChangeResult {
  success: boolean
  port?: number
  target?: OscTarget
  error?: string
}
