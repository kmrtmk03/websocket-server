import { Client as OscClient } from 'node-osc'

/**
 * OSC通信を管理するサービスクラス
 * メインプロセスで使用され、OSCメッセージの送信とポート管理を担当します。
 */
export class OscService {
  private client: OscClient
  private host: string
  private port: number

  /**
   * コンストラクタ
   * @param host ホスト名（デフォルト: 127.0.0.1）
   * @param port ポート番号（デフォルト: 9000）
   */
  constructor(host = '127.0.0.1', port = 9000) {
    this.host = host
    this.port = port
    this.client = new OscClient(this.host, this.port)
    console.log(`OscService initialized: ${this.host}:${this.port}`)
  }

  /**
   * OSCメッセージを送信します
   * @param address OSCアドレス（例: /scene）
   * @param args 送信する引数
   * @returns 送信結果のPromise
   */
  public async send(address: string, ...args: (string | number)[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.send(address, ...args, (err: Error | null) => {
        if (err) {
          console.error(`OSC送信失敗: ${address}`, err)
          reject(err)
        } else {
          console.log(`OSC送信成功: ${address}`, args)
          resolve()
        }
      })
    })
  }

  /**
   * 送信先ポートを変更します
   * クライアントを一度閉じて新しいポートで再接続します
   * @param port 新しいポート番号
   */
  public setPort(port: number): void {
    if (this.port === port) return

    try {
      // 既存のクライアントを閉じる
      this.client.close()

      this.port = port
      this.client = new OscClient(this.host, this.port)

      console.log(`OSCポートを変更しました: ${this.host}:${this.port}`)
    } catch (error) {
      console.error('OSCポート変更中にエラーが発生しました:', error)
      throw error
    }
  }

  /**
   * 現在のポート番号を取得します
   */
  public getPort(): number {
    return this.port
  }

  /**
   * リソースを解放します
   * アプリケーション終了時に呼び出してください
   */
  public close(): void {
    this.client.close()
    console.log('OSCクライアントを終了しました')
  }
}
