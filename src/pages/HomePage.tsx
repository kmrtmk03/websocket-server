import { useState, type ReactElement } from 'react'
import './HomePage.sass'

/**
 * ホームページコンポーネント
 * OSC送信ボタンを表示
 */
function HomePage(): ReactElement {
  const [port, setPort] = useState(9000)

  // ポート番号を変更する
  const handlePortChange = async (): Promise<void> => {
    if (window.electronAPI) {
      const result = await window.electronAPI.setPort(port)
      console.log('ポート変更結果:', result)
    }
  }

  // OSCメッセージを送信する
  const handleSendOsc = async (sceneNumber: number): Promise<void> => {
    try {
      // Electronが利用可能かチェック
      if (window.electronAPI) {
        // /scene アドレスにシーン番号を送信
        const result = await window.electronAPI.sendOsc('/scene', sceneNumber)
        console.log('OSC送信結果:', result)
      } else {
        console.warn('Electron APIが利用できません（ブラウザモード）')
      }
    } catch (error) {
      console.error('OSC送信エラー:', error)
    }
  }

  return (
    <div className="home-page">
      <h1>OSC コントローラー</h1>
      <p className="description">ボタンをクリックしてOSCメッセージを送信</p>

      <div className="button-grid">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            className="osc-button"
            onClick={() => handleSendOsc(num)}
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
