import { useState, useEffect } from 'react'

/**
 * WebSocketサーバー制御のためのカスタムフック
 * サーバーのポート管理とログ受信機能を提供します
 */
export const useWebSocketServer = () => {
  const [wsPort, setWsPort] = useState(8080)
  const [logs, setLogs] = useState<string[]>([])

  // コンポーネントマウント時にログリスナーを登録
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onWsLog((message) => {
        setLogs((prevLogs) => {
          // 最新のログ50件のみを保持
          const newLogs = [...prevLogs, message]
          if (newLogs.length > 50) {
            return newLogs.slice(newLogs.length - 50)
          }
          return newLogs
        })
      })
    }
  }, [])

  /**
   * WebSocketポートを変更します
   */
  const handleWsPortChange = async (): Promise<void> => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.setWsPort(wsPort)
        console.log('WebSocketポート変更結果:', result)
      } catch (error) {
        console.error('WebSocketポート変更エラー:', error)
      }
    }
  }

  /**
   * ログをクリアします
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
