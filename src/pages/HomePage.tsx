import type { ReactElement } from 'react'
import './HomePage.sass'

/**
 * ホームページコンポーネント
 * OSC送信ボタンを表示
 */
function HomePage(): ReactElement {
  // OSCメッセージを送信する
  const handleSendOsc = async (sceneNumber: number): Promise<void> => {
    try {
      // Electronが利用可能かチェック
      if (window.electronAPI) {
        const result = await window.electronAPI.sendOsc(`/scene/${sceneNumber}`)
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

      <p className="info">
        送信先: localhost:9000<br />
        メッセージ形式: /scene/[番号]
      </p>
    </div>
  )
}

export default HomePage
