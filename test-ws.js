import { WebSocket } from 'ws'

// WSSサーバーに接続（自己署名証明書を許可）
const ws = new WebSocket('wss://localhost:8080', {
  rejectUnauthorized: false  // 自己署名証明書を許可（開発用）
})

ws.on('open', function open() {
  console.log('✅ WSSサーバーに接続しました')

  // App1向けテスト用メッセージ
  const message1 = {
    address: '/app1/scene',
    args: [1]
  };

  console.log('📤 [App1] 送信中:', JSON.stringify(message1));
  ws.send(JSON.stringify(message1));

  // App2向けテスト用メッセージ
  const message2 = {
    address: '/app2/scene',
    args: [2]
  };

  setTimeout(() => {
    console.log('📤 [App2] 送信中:', JSON.stringify(message2));
    ws.send(JSON.stringify(message2));
  }, 500);

  // 少し待ってから終了
  setTimeout(() => {
    console.log('✨ 送信完了');
    ws.close();
    process.exit(0);
  }, 1000);
});

ws.on('error', (error) => {
  console.error('❌ エラー:', error.message);
  console.log('ヒント: アプリが起動していないか、ポート8080が使われていない可能性があります。');
  process.exit(1);
});
