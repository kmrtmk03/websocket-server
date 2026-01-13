import { useState } from 'react'

export type OscTarget = 'app1' | 'app2'

/**
 * OSC制御のためのカスタムフック
 * 
 * 役割:
 * 1. レンダラープロセスからメインプロセスへのOSC送信要求
 * 2. 送信先ポート番号の状態管理 (App1, App2)
 */
export const useOscControl = () => {
  // App1 (Port 9000) の状態
  const [port1, setPort1] = useState(9000)
  // App2 (Port 10000) の状態
  const [port2, setPort2] = useState(10000)

  /**
   * OSCメッセージをメインプロセス経由で送信します
   * @param sceneNumber 送信するシーン番号
   * @param target 送信先のアプリケーション ('app1' | 'app2')
   */
  const sendOsc = async (sceneNumber: number, target: OscTarget = 'app1'): Promise<void> => {
    try {
      if (window.electronAPI) {
        // 例: /scene アドレスにシーン番号を送信
        const result = await window.electronAPI.sendOsc('/scene', [sceneNumber], target)
        console.log(`[OSC] ${target}への送信結果:`, result)
      } else {
        console.warn('Electron APIが利用できません（ブラウザモード）')
      }
    } catch (error) {
      console.error(`[OSC] ${target}への送信エラー:`, error)
    }
  }

  /**
   * OSCポート番号を変更します
   * @param target 対象のアプリケーション ('app1' | 'app2')
   */
  const handlePortChange = async (target: OscTarget): Promise<void> => {
    if (window.electronAPI) {
      try {
        const port = target === 'app2' ? port2 : port1
        const result = await window.electronAPI.setPort(port, target)
        console.log(`[OSC] ${target}のポート変更結果:`, result)
      } catch (error) {
        console.error(`[OSC] ${target}のポート変更エラー:`, error)
      }
    }
  }

  return {
    port1,
    setPort1,
    port2,
    setPort2,
    sendOsc,
    handlePortChange
  }
}


