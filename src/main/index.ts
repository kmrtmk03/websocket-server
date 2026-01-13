import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { Client as OscClient } from 'node-osc'

// OSC設定
const OSC_HOST = '127.0.0.1'
let oscPort = 9000

// OSCクライアントを作成
let oscClient = new OscClient(OSC_HOST, oscPort)

// メインウィンドウの参照を保持
let mainWindow: BrowserWindow | null = null

/**
 * OSCメッセージを送信する
 * @param address OSCアドレス（例: /scene/1）
 * @param args 送信する引数（オプション）
 */
function sendOscMessage(address: string, ...args: (string | number)[]): void {
  oscClient.send(address, ...args, (err: Error | null) => {
    if (err) {
      console.error('OSC送信エラー:', err)
    } else {
      console.log(`OSC送信成功: ${address}`, args)
    }
  })
}

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

// IPCハンドラー: OSCメッセージ送信
ipcMain.handle('osc:send', (_event, address: string, ...args: (string | number)[]) => {
  sendOscMessage(address, ...args)
  return { success: true, address, args }
})

// IPCハンドラー: ポート番号変更
ipcMain.handle('osc:set-port', (_event, port: number) => {
  if (port === oscPort) return { success: true, port }

  try {
    // 古いクライアントを閉じる
    oscClient.close()

    // 新しいポートで再作成
    oscPort = port
    oscClient = new OscClient(OSC_HOST, oscPort)

    console.log(`OSCポートを変更しました: ${port}`)
    return { success: true, port }
  } catch (error) {
    console.error('OSCポート変更エラー:', error)
    return { success: false, error }
  }
})

// アプリケーションの初期化が完了したらウィンドウを作成
app.whenReady().then(() => {
  createWindow()

  // macOS: ドックアイコンクリック時にウィンドウがなければ再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 全てのウィンドウが閉じられたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// アプリ終了時にOSCクライアントをクローズ
app.on('will-quit', () => {
  oscClient.close()
})
