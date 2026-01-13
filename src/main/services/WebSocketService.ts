import { WebSocketServer } from 'ws'
import { BrowserWindow } from 'electron'

/**
 * WebSocketサーバーを管理するサービスクラス
 * メインプロセスで使用され、WebSocketメッセージの受信とレンダラーへのログ送信を担当します。
 */
export class WebSocketService {
  private wss: WebSocketServer | null = null
  private port: number
  private mainWindow: BrowserWindow | null = null
  private onMessageCallback: ((message: unknown) => void) | null = null

  /**
   * コンストラクタ
   * @param port ポート番号（デフォルト: 8080）
   */
  constructor(port = 8080) {
    this.port = port
  }

  /**
   * メインウィンドウを設定します（ログ送信のため）
   * @param window BrowserWindowのインスタンス
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  /**
   * メッセージ受信時のコールバックを設定します
   * @param callback コールバック関数
   */
  public onMessage(callback: (message: unknown) => void): void {
    this.onMessageCallback = callback
  }

  /**
   * WebSocketサーバーを起動します
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
      this.wss = new WebSocketServer({ port: this.port })
      console.log(`WebSocketサーバー起動: port ${this.port}`)
      this.log(`サーバー起動: port ${this.port}`)

      this.wss.on('connection', (ws) => {
        console.log('クライアント接続')
        this.log('クライアント接続')

        ws.on('message', (data) => {
          try {
            const message = data.toString()
            console.log('受信メッセージ:', message)
            this.log(`受信: ${message}`)

            // JSONパースを試みる
            try {
              const json = JSON.parse(message)

              // コールバックを呼び出し
              if (this.onMessageCallback) {
                this.onMessageCallback(json)
              }
            } catch (e) {
              console.warn('JSONパースエラー:', e)
              this.log(`警告: 無効なJSONフォーマット`)
            }

          } catch (error) {
            console.error('メッセージ処理エラー:', error)
          }
        })

        ws.on('close', () => {
          console.log('クライアント切断')
          this.log('クライアント切断')
        })

        ws.on('error', (error) => {
          console.error('WebSocketエラー:', error)
          this.log(`エラー: ${error.message}`)
        })
      })

      this.wss.on('error', (error) => {
        console.error('サーバーエラー:', error)
        this.log(`サーバーエラー: ${error.message}`)
      })

    } catch (error) {
      console.error('WebSocketサーバー起動失敗:', error)
      this.log(`起動失敗: ${error}`)
    }
  }

  /**
   * WebSocketサーバーを停止します
   */
  public stop(): void {
    if (this.wss) {
      this.wss.close()
      this.wss = null
      console.log('WebSocketサーバー停止')
      this.log('サーバー停止')
    }
  }

  /**
   * レンダラープロセスにログを送信します
   * @param message ログメッセージ
   */
  private log(message: string): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('ws:log', message)
    }
  }
}
