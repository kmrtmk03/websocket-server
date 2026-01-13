import type { ReactElement } from 'react'
import { useOscControl } from '../hooks/useOscControl'
import { useWebSocketServer } from '../hooks/useWebSocketServer'
import './HomePage.sass'

/**
 * ホームページコンポーネント
 * 
 * 構成:
 * 1. OSC Sender セクション: ボタンによる手動OSC送信とポート設定
 * 2. WebSocket Server セクション: サーバーポート設定と受信ログ表示
 */
function HomePage(): ReactElement {
  // カスタムフックを使用してロジックを分離
  const { port, setPort, handlePortChange, sendOsc } = useOscControl()
  const { wsPort, setWsPort, handleWsPortChange, logs, clearLogs } = useWebSocketServer()

  return (
    <div className="home-page">
      <h1>OSC コントローラー & WebSocket サーバー</h1>

      {/* OSC 送信セクション */}
      <section className="section">
        <h2>OSC Sender</h2>
        <p className="description">ボタンをクリックしてOSCメッセージを送信</p>

        <div className="button-grid">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              className="osc-button"
              onClick={() => sendOsc(num)}
            >
              Scene {num}
            </button>
          ))}
        </div>

        <div className="settings">
          <label>
            Target Port:
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              onBlur={handlePortChange}
              onKeyDown={(e) => e.key === 'Enter' && handlePortChange()}
            />
          </label>
        </div>

        <p className="info">
          送信先: 127.0.0.1:{port} | 形式: /scene [番号]
        </p>
      </section>

      <div className="divider"></div>

      {/* WebSocket サーバーセクション */}
      <section className="section">
        <h2>WebSocket Server</h2>
        <div className="settings">
          <label>
            Server Port:
            <input
              type="number"
              value={wsPort}
              onChange={(e) => setWsPort(Number(e.target.value))}
              onBlur={handleWsPortChange}
              onKeyDown={(e) => e.key === 'Enter' && handleWsPortChange()}
            />
          </label>
        </div>

        <div className="log-container">
          <div className="log-header">
            <span>Server Logs</span>
            <button onClick={clearLogs} className="clear-btn">Clear</button>
          </div>
          <div className="logs">
            {logs.length === 0 ? (
              <div className="log-item empty">ログなし</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="log-item">{log}</div>
              ))
            )}
            {/* 最新ログへスクロールするためのダミー要素 */}
            <div style={{ float: "left", clear: "both" }}
              ref={(el) => { el?.scrollIntoView({ behavior: "smooth" }); }}>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
