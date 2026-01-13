import { useState } from 'react'

/**
 * OSC制御のためのカスタムフック
 * OSCメッセージの送信機能とポート番号管理機能を提供します。
 */
export const useOscControl = () => {
  const [port, setPort] = useState(9000)

  /**
   * OSCメッセージを送信します
   * @param sceneNumber 送信するシーン番号
   */
  const sendOsc = async (sceneNumber: number): Promise<void> => {
    try {
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

  /**
   * OSCポート番号を変更します
   */
  const handlePortChange = async (): Promise<void> => {
    if (window.electronAPI) {
      const result = await window.electronAPI.setPort(port)
      console.log('ポート変更結果:', result)
    }
  }

  return {
    port,
    setPort,
    sendOsc,
    handlePortChange
  }
}
