import type { ReactElement } from 'react'
import { useOscControl } from '../hooks/useOscControl'
import { useWebSocketServer } from '../hooks/useWebSocketServer'
import OscControlPanel from '../components/OscControlPanel'
import WebSocketLogPanel from '../components/WebSocketLogPanel'
import './HomePage.sass'

/**
 * ホームページコンポーネント
 * 
 * アプリケーションのメインUI。OSC送信とWebSocketサーバー管理機能を提供します。
 * 
 * 構成:
 * 1. OSC Sender セクション
 *    - App1 コントロールパネル: ポート設定 + 送信ボタン (Port 9000)
 *    - App2 コントロールパネル: ポート設定 + 送信ボタン (Port 10000)
 * 2. WebSocket Server セクション
 *    - サーバーポート設定
 *    - 受信ログ表示
 */
function HomePage(): ReactElement {
  // ==========================================================================
  // カスタムフックによるロジック分離
  // ==========================================================================

  /**
   * OSC制御用のフック
   * - port1/port2: 各ターゲットのポート番号
   * - sendOsc: OSCメッセージ送信関数
   * - handlePortChange: ポート変更処理
   */
  const { port1, setPort1, port2, setPort2, handlePortChange, sendOsc } = useOscControl()

  /**
   * WebSocketサーバー制御用のフック
   * - wsPort: サーバーポート番号
   * - logs: 受信ログ配列
   * - handleWsPortChange: ポート変更処理
   * - clearLogs: ログクリア
   */
  const { wsPort, setWsPort, handleWsPortChange, logs, clearLogs } = useWebSocketServer()

  // ==========================================================================
  // レンダリング
  // ==========================================================================

  return (
    <div className="home-page">
      <h1>OSC コントローラー & WebSocket サーバー</h1>

      <div className="container">
        {/* ===== OSC 送信セクション ===== */}
        <section className="section">
          <h2>OSC Sender</h2>
          <p className="description">それぞれのポートへOSCメッセージを送信</p>

          {/* App1 コントロールパネル */}
          <OscControlPanel
            title="App 1"
            target="app1"
            port={port1}
            onPortChange={setPort1}
            onPortSubmit={() => handlePortChange('app1')}
            onSendOsc={(num) => sendOsc(num, 'app1')}
          />

          <div className="divider-h"></div>

          {/* App2 コントロールパネル */}
          <OscControlPanel
            title="App 2"
            target="app2"
            port={port2}
            onPortChange={setPort2}
            onPortSubmit={() => handlePortChange('app2')}
            onSendOsc={(num) => sendOsc(num, 'app2')}
            isApp2={true}
          />

          <p className="info">
            形式: /scene [番号]
          </p>
        </section>

        {/* ===== WebSocket サーバーセクション ===== */}
        <section className="section">
          <h2>WebSocket Server</h2>

          {/* ポート設定 */}
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

          {/* ログ表示パネル */}
          <WebSocketLogPanel
            logs={logs}
            onClear={clearLogs}
          />
        </section>
      </div>
    </div>
  )
}

export default HomePage

