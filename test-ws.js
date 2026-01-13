import { WebSocket } from 'ws';

// WebSocketサーバーに接続
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('✅ WebSocketサーバーに接続しました');

  // テスト用メッセージ
  const message = {
    address: '/scene',
    args: [3] // シーン3をテスト送信
  };

  console.log('📤 送信中:', JSON.stringify(message, null, 2));
  ws.send(JSON.stringify(message));

  console.log('✨ 送信完了');

  // 少し待ってから終了
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 1000);
});

ws.on('error', (error) => {
  console.error('❌ エラー:', error.message);
  console.log('ヒント: アプリが起動していないか、ポート8080が使われていない可能性があります。');
  process.exit(1);
});
