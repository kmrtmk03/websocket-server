import { useEffect } from 'react'

const useScrollLock = () => {
  useEffect(() => {
    // 元のoverflowスタイルを保存
    const originalStyle = window.getComputedStyle(document.body).overflow
    // スクロールを無効にする
    document.body.style.overflow = 'hidden'

    // コンポーネントのアンマウント時に元のスタイルに戻す
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, []) // 空の依存配列で、初回レンダリング時にのみ実行
}

export default useScrollLock