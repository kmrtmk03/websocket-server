import type { ReactElement } from 'react'
import { useOscControl } from '../hooks/useOscControl'
import './HomePage.sass'

/**
 * ホームページコンポーネント
 * OSC送信ボタンを表示
 */
function HomePage(): ReactElement {
  const { port, setPort, sendOsc, handlePortChange } = useOscControl()

  return (
    <div className="home-page">
      <h1>OSC コントローラー</h1>
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

      <div className="port-settings">
        <label>
          Port:
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
        送信先: 127.0.0.1:{port}<br />
        メッセージ形式: /scene <br />
        値: [番号]
      </p>
    </div>
  )
}

export default HomePage
