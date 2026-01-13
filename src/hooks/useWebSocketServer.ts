import { useState, useEffect } from 'react'
import { DEFAULT_WS_PORT, MAX_LOG_COUNT } from '../constants/config'

/**
 * WebSocketサーバー制御のためのカスタムフック
 * 
 * 役割:
 * 1. レンダラープロセスでのポート番号管理
 * 2. メインプロセスから送られてくるログの受信と状態管理
 * 
 * @returns WebSocket制御に必要な状態と関数
 */
export const useWebSocketServer = () => {
  // WebSocketサーバーのポート番号
  const [wsPort, setWsPort] = useState(DEFAULT_WS_PORT)

  // サーバーログの配列
  const [logs, setLogs] = useState<string[]>([])

  /**
   * コンポーネントマウント時にログリスナーを登録
   * メインプロセスからの 'ws:log' イベントを受信してログ配列に追加
   */
  useEffect(() => {
    if (window.electronAPI) {
      // メインプロセスからのログ・イベントを受信
      window.electronAPI.onWsLog((message) => {
        setLogs((prevLogs) => {
          // 最新のログのみを保持してパフォーマンスを維持
          const newLogs = [...prevLogs, message]
          if (newLogs.length > MAX_LOG_COUNT) {
            return newLogs.slice(newLogs.length - MAX_LOG_COUNT)
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

