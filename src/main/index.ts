import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { OscService } from './services/OscService'
import { WebSocketService } from './services/WebSocketService'

// --- サービス初期化 ---

// OSCサービスのインスタンス化 (複数ターゲット)
// App1: Port 9000
const oscService1 = new OscService('127.0.0.1', 9000)
// App2: Port 10000
const oscService2 = new OscService('127.0.0.1', 10000)

// WebSocketサービスのインスタンス化
// ポート: 8080 (初期値)
const wsService = new WebSocketService(8080)

// --- ブリッジロジック (WebSocket -> OSC) ---
// WebSocketService側でバリデーション済みのメッセージを受け取る
wsService.onMessage(async (data) => {
  try {
    const { address, args } = data

    if (address.startsWith('/app1')) {
      // /app1... -> App1 (Port 9000) へ送信
      // プレフィックスを削除して送信 (例: /app1/scene -> /scene)
      const oscAddress = address.replace('/app1', '')
      console.log(`[Bridge] App1へ転送: ${address} -> ${oscAddress}`)
      await oscService1.send(oscAddress, ...args)
    } else if (address.startsWith('/app2')) {
      // /app2... -> App2 (Port 10000) へ送信
      // プレフィックスを削除して送信 (例: /app2/scene -> /scene)
      const oscAddress = address.replace('/app2', '')
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

// --- IPCハンドラー設定 ---

// IPCハンドラー登録：OSCメッセージ送信
ipcMain.handle('osc:send', async (_event, address: string, args: (string | number)[], target: 'app1' | 'app2' = 'app1') => {
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

// IPCハンドラー登録：OSC送信ポート変更
ipcMain.handle('osc:set-port', (_event, port: number, target: 'app1' | 'app2') => {
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

// IPCハンドラー登録：WebSocket受信ポート変更
ipcMain.handle('ws:set-port', (_event, port: number) => {
  try {
    wsService.start(port)
    return { success: true, port }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// --- アプリ初期化 ---

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

