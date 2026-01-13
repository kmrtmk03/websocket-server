import { useState, useEffect } from 'react'

/**
 * WebSocketサーバー制御のためのカスタムフック
 * 
 * 役割:
 * 1. レンダラープロセスでのポート番号管理
 * 2. メインプロセスから送られてくるログの受信と状態管理
 */
export const useWebSocketServer = () => {
  // WebSocketサーバーのポート番号（初期値: 8080）
  const [wsPort, setWsPort] = useState(8080)

  // サーバーログの配列
  const [logs, setLogs] = useState<string[]>([])

  // コンポーネントマウント時にログリスナーを登録
  useEffect(() => {
    if (window.electronAPI) {
      // メインプロセスからのログ・イベントを受信
      window.electronAPI.onWsLog((message) => {
        setLogs((prevLogs) => {
          // 最新のログ50件のみを保持してパフォーマンスを維持
          const newLogs = [...prevLogs, message]
          if (newLogs.length > 50) {
            return newLogs.slice(newLogs.length - 50)
          }
          return newLogs
        })
      })
    }
  }, []) // 初回のみ実行

  /**
   * WebSocketポートを変更します
   * メインプロセスのWebSocketサーバー再起動をトリガーします
   */
  const handleWsPortChange = async (): Promise<void> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.setWsPort(wsPort)
        console.log('[WS] ポート変更結果:', result)
      } catch (error) {
        console.error('[WS] ポート変更エラー:', error)
      }
    }
  }

  /**
   * 表示されているログをクリアします
   */
  const clearLogs = () => {
    setLogs([])
  }

  return {
    wsPort,
    setWsPort,
    logs,
    handleWsPortChange,
    clearLogs
  }
}

