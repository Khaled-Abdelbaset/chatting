const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

const onlineUsers = {};

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    try {
      const msg = JSON.parse(message);
      console.log('Parsed message:', msg);
      if (msg.login) {
        if (typeof msg.username === 'string' && msg.username.trim() !== '') {
          if (!onlineUsers[msg.username]) {
            ws.username = msg.username;
            onlineUsers[ws.username] = ws;
            broadcast({
              type: 'login',
              message: `${ws.username} has joined the chat`,
              online: Object.keys(onlineUsers),
            });
          } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Username already taken.' }));
          }
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid username.' }));
        }
      } else if (msg.body) {
        if (typeof msg.body === 'string' && msg.body.trim() !== '') {
          broadcast({
            type: 'chat',
            message: msg.body,
            online: Object.keys(onlineUsers),
          });
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message body.' }));
        }
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Error processing message.' }));
    }
  });

  ws.on('close', function () {
    if (ws.username) {
      delete onlineUsers[ws.username];
      broadcast({
        type: 'logout',
        message: `${ws.username} has left the chat`,
        online: Object.keys(onlineUsers),
      });
    }
  });

  ws.on('error', function (error) {
    console.error('WebSocket error:', error);
  });
});