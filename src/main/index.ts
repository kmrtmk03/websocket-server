/**
 * Electronメインプロセス
 * 
 * このファイルはElectronアプリケーションのエントリーポイントです。
 * 
 * 主な役割:
 * 1. OSCサービスの初期化と管理（2系統: App1/App2）
 * 2. WebSocketサーバーの初期化とOSCへのブリッジ
 * 3. BrowserWindowの作成とライフサイクル管理
 * 4. IPCハンドラーの登録（レンダラープロセスとの通信）
 */

import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { OscService } from './services/OscService'
import { WebSocketService } from './services/WebSocketService'

/**
 * OSC送信先のターゲット識別子
 */
type OscTarget = 'app1' | 'app2'

// =============================================================================
// 定数定義（メインプロセス用）
// =============================================================================

/** OSC送信先ホスト（ローカルホスト） */
const OSC_HOST = '127.0.0.1'

/** App1のデフォルトOSCポート */
const DEFAULT_OSC_PORT_APP1 = 9000

/** App2のデフォルトOSCポート */
const DEFAULT_OSC_PORT_APP2 = 10000

/** WebSocketサーバーのデフォルトポート */
const DEFAULT_WS_PORT = 8080

/** OSC振り分け用のアドレスプレフィックス */
const APP_PREFIXES = {
  app1: '/app1',
  app2: '/app2'
} as const

// =============================================================================
// サービス初期化
// =============================================================================

/**
 * OSCサービスのインスタンス（複数ターゲット対応）
 * - oscService1: App1向け（デフォルト: Port 9000）
 * - oscService2: App2向け（デフォルト: Port 10000）
 */
const oscService1 = new OscService(OSC_HOST, DEFAULT_OSC_PORT_APP1)
const oscService2 = new OscService(OSC_HOST, DEFAULT_OSC_PORT_APP2)

/**
 * WebSocketサーバーサービス
 * 外部アプリからのJSONメッセージを受信し、OSCへ転送します
 */
const wsService = new WebSocketService(DEFAULT_WS_PORT)

// =============================================================================
// ブリッジロジック (WebSocket -> OSC)
// =============================================================================

/**
 * WebSocketで受信したメッセージをOSCに転送するブリッジ処理
 * 
 * 振り分けルール:
 * - アドレスが /app1 で始まる -> App1 (oscService1) へ送信
 * - アドレスが /app2 で始まる -> App2 (oscService2) へ送信
 * - それ以外 -> デフォルトでApp1へ送信
 * 
 * プレフィックス削除:
 * - /app1/scene -> /scene として送信
 * - /app2/scene -> /scene として送信
 */
wsService.onMessage(async (data) => {
  try {
    const { address, args } = data

    if (address.startsWith(APP_PREFIXES.app1)) {
      // App1へ転送（プレフィックスを削除）
      const oscAddress = address.replace(APP_PREFIXES.app1, '')
      console.log(`[Bridge] App1へ転送: ${address} -> ${oscAddress}`)
      await oscService1.send(oscAddress, ...args)
    } else if (address.startsWith(APP_PREFIXES.app2)) {
      // App2へ転送（プレフィックスを削除）
      const oscAddress = address.replace(APP_PREFIXES.app2, '')
      console.log(`[Bridge] App2へ転送: ${address} -> ${oscAddress}`)
      await oscService2.send(oscAddress, ...args)
    } else {
      // デフォルト: App1へ送信（プレフィックスなしの場合はそのまま）
      console.log(`[Bridge] デフォルト(App1)へ転送: ${address}`)
      await oscService1.send(address, ...args)
    }
  } catch (error) {
    console.error('[Bridge] OSC転送エラー:', error)
  }
})

// --- アプリケーションライフサイクル ---

// メインウィンドウの参照を保持
let mainWindow: BrowserWindow | null = null

/**
 * メインウィンドウを作成する
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // 準備完了まで非表示
    autoHideMenuBar: true, // メニューバーを自動的に隠す
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false, // プリロードスクリプトでNode.js APIを使用可能にする
    },
  })

  // WebSocketサービスにウィンドウをセット（レンダラーへのログ送信のため）
  wsService.setMainWindow(mainWindow)

  // サーバー起動（再起動耐性あり）
  wsService.start()

  // ウィンドウの準備が完了したら表示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 外部リンクはデフォルトブラウザで開く
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 開発モードではdevサーバーに接続、本番ではローカルファイルを読み込む
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// =============================================================================
// IPCハンドラー設定
// =============================================================================

/**
 * OSCメッセージ送信ハンドラー
 * 
 * レンダラープロセスからの要求を受けて、指定されたターゲットにOSCメッセージを送信します。
 * 
 * @param address - OSCアドレス（例: /scene）
 * @param args - 送信する引数の配列
 * @param target - 送信先ターゲット（'app1' | 'app2'）
 */
ipcMain.handle('osc:send', async (_event, address: string, args: (string | number)[], target: OscTarget = 'app1') => {
  try {
    // ターゲットに応じて送信サービスを切り替え
    if (target === 'app2') {
      await oscService2.send(address, ...args)
    } else {
      await oscService1.send(address, ...args)
    }
    return { success: true, address, args, target }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

/**
 * OSCポート変更ハンドラー
 * 
 * 指定されたターゲットのOSC送信先ポートを変更します。
 * 
 * @param port - 新しいポート番号
 * @param target - 対象ターゲット（'app1' | 'app2'）
 */
ipcMain.handle('osc:set-port', (_event, port: number, target: OscTarget) => {
  try {
    if (target === 'app2') {
      oscService2.setPort(port)
    } else {
      oscService1.setPort(port)
    }
    return { success: true, port, target }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

/**
 * WebSocketポート変更ハンドラー
 * 
 * WebSocketサーバーの受信ポートを変更し、サーバーを再起動します。
 * 
 * @param port - 新しいポート番号
 */
ipcMain.handle('ws:set-port', (_event, port: number) => {
  try {
    wsService.start(port)
    return { success: true, port }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// --- アプリ初期化 ---

/**
 * 開発時のみ: ローカルホストへの自己署名証明書エラーを無視
 * これによりレンダラープロセスからWSSサーバーへの接続が可能になります
 * 
 * 注意: 本番環境では適切な証明書を使用することを推奨
 */
app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
  // ローカルホスト（開発環境）の場合のみ証明書エラーを無視
  if (url.startsWith('wss://localhost') || url.startsWith('https://localhost')) {
    event.preventDefault()
    callback(true)  // 証明書を信頼する
  } else {
    callback(false)  // その他のURLは通常のセキュリティチェックを行う
  }
})

// アプリケーションの初期化が完了したらウィンドウを作成
app.whenReady().then(() => {
  createWindow()

  // macOS: ドックアイコンクリック時にウィンドウがなければ再作成
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 全てのウィンドウが閉じられたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// アプリ終了時にOSCサービスを終了
app.on('will-quit', () => {
  oscService1.close()
  oscService2.close()
})

