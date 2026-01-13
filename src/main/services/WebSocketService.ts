/**
 * WebSocketサーバーサービス（HTTPS/WSS対応）
 * 
 * 外部アプリからのJSONメッセージを受信し、OSC転送用のコールバックを呼び出します。
 * HTTPSサーバーを使用してセキュアなWebSocket（WSS）通信を提供します。
 * 
 * @module WebSocketService
 */

import { WebSocketServer } from 'ws'
import { BrowserWindow, app } from 'electron'
import https from 'https'
import fs from 'fs'
import path from 'path'

/**
 * WebSocket経由で受信するOSC転送用メッセージのインターフェース
 * 
 * @example
 * {
 *   address: "/app1/scene",
 *   args: [1]
 * }
 */
interface OscTransferMessage {
  /** OSCアドレス（例: /scene, /app1/scene） */
  address: string
  /** OSCメッセージの引数 */
  args: (string | number)[]
}

/**
 * WebSocketサーバーを管理するサービスクラス（HTTPS/WSS対応）
 * 
 * 役割:
 * 1. HTTPSサーバーを基盤としたセキュアなWebSocketサーバーの起動・停止
 * 2. 外部アプリからのJSONメッセージ受信
 * 3. メインプロセスへのコールバック通知 (OSC転送用)
 * 4. レンダラープロセスへのログ送信
 */
export class WebSocketService {
  private wss: WebSocketServer | null = null
  private httpsServer: https.Server | null = null  // HTTPSサーバーのインスタンス
  private port: number
  private mainWindow: BrowserWindow | null = null
  private onMessageCallback: ((message: OscTransferMessage) => void) | null = null

  /**
   * コンストラクタ
   * @param port ポート番号（デフォルト: 8080）
   */
  constructor(port = 8080) {
    this.port = port
  }

  /**
   * ログ送信先のメインウィンドウを設定します
   * @param window BrowserWindowのインスタンス
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * 有効なメッセージを受信した際のコールバックを登録します
   * @param callback OSC転送用メッセージを受け取る関数
   */
  public onMessage(callback: (message: OscTransferMessage) => void): void {
    this.onMessageCallback = callback
  }

  /**
   * 証明書ファイルのパスを取得します
   * 開発時はプロジェクトルートの certs ディレクトリを、
   * 本番時はアプリリソースのパスを使用します
   * @returns 証明書ディレクトリのパス
   */
  private getCertsPath(): string {
    // 開発モードの判定: process.env.NODE_ENV または app.isPackaged を使用
    const isDev = !app.isPackaged

    if (isDev) {
      // 開発時: プロジェクトルートの certs ディレクトリ
      return path.join(process.cwd(), 'certs')
    } else {
      // 本番時: アプリのリソースディレクトリ
      return path.join(process.resourcesPath, 'certs')
    }
  }

  /**
   * WebSocketサーバーを起動します（HTTPS/WSS）
   * 既に起動している場合は再起動します
   * @param port ポート番号（指定がなければ現在の設定を使用）
   */
  public start(port?: number): void {
    if (this.wss) {
      this.stop()
    }

    if (port) {
      this.port = port
    }

    try {
      // 証明書ファイルを読み込む
      const certsPath = this.getCertsPath()
      const certPath = path.join(certsPath, 'cert.pem')
      const keyPath = path.join(certsPath, 'key.pem')

      console.log(`[WebSocket] 証明書パス: ${certsPath}`)

      // 証明書ファイルの存在チェック
      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        throw new Error(`証明書ファイルが見つかりません: ${certsPath}`)
      }

      // HTTPSサーバーオプション
      const httpsOptions: https.ServerOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      }

      // HTTPSサーバーを作成
      this.httpsServer = https.createServer(httpsOptions)

      // HTTPSサーバーをWebSocketServerに渡す
      this.wss = new WebSocketServer({ server: this.httpsServer })

      // HTTPSサーバーを起動
      this.httpsServer.listen(this.port, () => {
        console.log(`[WebSocket] WSSサーバー起動: wss://localhost:${this.port}`)
        this.log(`WSSサーバー起動: wss://localhost:${this.port}`)
      })

      this.wss.on('connection', (ws) => {
        console.log('[WebSocket] クライアント接続')
        this.log('クライアント接続')

        ws.on('message', (data) => {
          try {
            const messageStr = data.toString()
            console.log('[WebSocket] 受信:', messageStr)
            this.log(`受信: ${messageStr}`)

            // JSONパースとバリデーション
            try {
              const json = JSON.parse(messageStr) as OscTransferMessage

              // 必須フィールドのチェック
              if (json && typeof json.address === 'string' && Array.isArray(json.args)) {
                // コールバックを呼び出し (OSC送信へ)
                if (this.onMessageCallback) {
                  this.onMessageCallback(json)
                }
              } else {
                const errorMsg = '無効なフォーマット: { address: string, args: [] } が必要です'
                console.warn(`[WebSocket] ${errorMsg}`)
                this.log(`警告: ${errorMsg}`)
              }
            } catch (e) {
              console.warn('[WebSocket] JSONパースエラー:', e)
              this.log(`警告: 無効なJSONフォーマット`)
            }

          } catch (error) {
            console.error('[WebSocket] メッセージ処理エラー:', error)
          }
        })

        ws.on('close', () => {
          console.log('[WebSocket] クライアント切断')
          this.log('クライアント切断')
        })

        ws.on('error', (error) => {
          console.error('[WebSocket] エラー:', error)
          this.log(`エラー: ${error.message}`)
        })
      })

      this.wss.on('error', (error) => {
        console.error('[WebSocket] サーバーエラー:', error)
        this.log(`サーバーエラー: ${error.message}`)
      })

    } catch (error) {
      console.error('[WebSocket] 起動失敗:', error)
      this.log(`起動失敗: ${error}`)
    }
  }

  /**
   * WebSocketサーバーを停止します
   * HTTPSサーバーも含めて適切にクローズします
   */
  public stop(): void {
    if (this.wss) {
      this.wss.close()
      this.wss = null
    }

    // HTTPSサーバーもクローズ
    if (this.httpsServer) {
      this.httpsServer.close()
      this.httpsServer = null
    }

    console.log('[WebSocket] WSSサーバー停止')
    this.log('WSSサーバー停止')
  }

  /**
   * レンダラープロセスにログを送信します
   * ウィンドウが破棄されている場合は送信しません
   * @param message ログメッセージ
   */
  private log(message: string): void {
    // ウィンドウが存在し、かつ破棄されていない場合のみ送信
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('ws:log', message)
    }
  }
}
