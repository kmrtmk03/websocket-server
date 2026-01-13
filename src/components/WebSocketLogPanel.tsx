import type { ReactElement } from 'react'
import { useRef, useEffect } from 'react'

/**
 * WebSocketLogPanelコンポーネントのProps
 */
interface WebSocketLogPanelProps {
  /** 表示するログの配列 */
  logs: string[]
  /** ログクリアボタンのコールバック */
  onClear: () => void
}

/**
 * WebSocketログパネルコンポーネント
 * 
 * 役割:
 * - WebSocketサーバーのログを表示
 * - 最新ログへの自動スクロール
 * - ログのクリア機能
 */
function WebSocketLogPanel({ logs, onClear }: WebSocketLogPanelProps): ReactElement {
  // 最新ログへスクロールするための参照
  const logEndRef = useRef<HTMLDivElement>(null)

  /**
   * ログが更新されたら最下部にスクロール
   */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="log-container">
      {/* ヘッダー: タイトルとクリアボタン */}
      <div className="log-header">
        <span>Server Logs</span>
        <button onClick={onClear} className="clear-btn">
          Clear
        </button>
      </div>

      {/* ログ表示エリア */}
      <div className="logs">
        {logs.length === 0 ? (
          // ログがない場合のプレースホルダー
          <div className="log-item empty">ログなし</div>
        ) : (
          // ログ一覧を表示
          logs.map((log, index) => (
            <div key={index} className="log-item">
              {log}
            </div>
          ))
        )}

        {/* 最新ログへスクロールするためのダミー要素 */}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export default WebSocketLogPanel
