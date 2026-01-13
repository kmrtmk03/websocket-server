import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { OscService } from './services/OscService'

// OSCサービスのインスタンス化
// ホスト: 127.0.0.1, ポート: 9000 (初期値)
const oscService = new OscService('127.0.0.1', 9000)

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

// IPCハンドラー登録：OSCメッセージ送信
ipcMain.handle('osc:send', async (_event, address: string, ...args: (string | number)[]) => {
  try {
    await oscService.send(address, ...args)
    return { success: true, address, args }
  } catch (error) {
    return { success: false, error }
  }
})

// IPCハンドラー登録：ポート番号変更
ipcMain.handle('osc:set-port', (_event, port: number) => {
  try {
    oscService.setPort(port)
    return { success: true, port }
  } catch (error) {
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

// アプリ終了時にOSCサービスを終了
app.on('will-quit', () => {
  oscService.close()
})
