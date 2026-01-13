import { useState } from 'react'

/**
 * OSC制御のためのカスタムフック
 * 
 * 役割:
 * 1. レンダラープロセスからメインプロセスへのOSC送信要求
 * 2. 送信先ポート番号の状態管理と変更要求
 */
export const useOscControl = () => {
  // ポート番号の状態（初期値: 9000）
  const [port, setPort] = useState(9000)

  /**
   * OSCメッセージをメインプロセス経由で送信します
   * @param sceneNumber 送信するシーン番号 (例: 1 -> /scene, [1])
   */
  const sendOsc = async (sceneNumber: number): Promise<void> => {
    try {
      if (window.electronAPI) {
        // /scene アドレスにシーン番号を送信
        const result = await window.electronAPI.sendOsc('/scene', sceneNumber)
        console.log('[OSC] 送信結果:', result)
      } else {
        console.warn('Electron APIが利用できません（ブラウザモード）')
      }
    } catch (error) {
      console.error('[OSC] 送信エラー:', error)
    }
  }

  /**
   * OSCポート番号を変更します
   * フォームのonBlurやonKeyDownイベントで呼び出されます
   */
  const handlePortChange = async (): Promise<void> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.setPort(port)
        console.log('[OSC] ポート変更結果:', result)
      } catch (error) {
        console.error('[OSC] ポート変更エラー:', error)
      }
    }
  }

  return {
    port,
    setPort,
    sendOsc,
    handlePortChange
  }
}

