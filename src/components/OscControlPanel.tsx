import type { ReactElement } from 'react'
import type { OscTarget } from '../types/osc'
import { SCENE_BUTTON_COUNT } from '../constants/config'

/**
 * OscControlPanelコンポーネントのProps
 */
interface OscControlPanelProps {
  /** パネルのタイトル（例: "App 1", "App 2"） */
  title: string
  /** OSCターゲット識別子 */
  target: OscTarget
  /** 現在のポート番号 */
  port: number
  /** ポート番号変更時のコールバック */
  onPortChange: (port: number) => void
  /** ポート設定確定時のコールバック（blur/Enter時） */
  onPortSubmit: () => void
  /** OSCメッセージ送信のコールバック */
  onSendOsc: (sceneNumber: number) => void
  /** App2用のスタイルを適用するかどうか */
  isApp2?: boolean
}

/**
 * OSCコントロールパネルコンポーネント
 * 
 * 役割:
 * - ポート番号の設定入力
 * - シーン送信ボタンの表示
 * 
 * App1とApp2で共通のUIを提供し、propsで挙動を切り替えます。
 */
function OscControlPanel({
  title,
  target,
  port,
  onPortChange,
  onPortSubmit,
  onSendOsc,
  isApp2 = false
}: OscControlPanelProps): ReactElement {
  /**
   * Enterキー押下時にポート設定を確定
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      onPortSubmit()
    }
  }

  return (
    <div className="app-control">
      {/* パネルタイトル */}
      <h3>{title}</h3>

      {/* ポート設定 */}
      <div className="settings">
        <label>
          Target Port:
          <input
            type="number"
            value={port}
            onChange={(e) => onPortChange(Number(e.target.value))}
            onBlur={onPortSubmit}
            onKeyDown={handleKeyDown}
          />
        </label>
      </div>

      {/* シーン送信ボタングリッド */}
      <div className="button-grid">
        {/* SCENE_BUTTON_COUNT個のボタンを生成 */}
        {Array.from({ length: SCENE_BUTTON_COUNT }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`osc-button ${isApp2 ? 'app2' : ''}`}
            onClick={() => onSendOsc(num)}
          >
            {/* ボタンラベル: App1-1, App2-1 など */}
            {target === 'app1' ? `App1-${num}` : `App2-${num}`}
          </button>
        ))}
      </div>
    </div>
  )
}

export default OscControlPanel
