const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 提供前端頁面
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>即時聊天室</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        #messages { list-style-type: none; margin: 0; padding: 0; }
        #messages li { padding: 5px 10px; background: #f3f3f3; margin: 5px 0; border-radius: 5px; }
        #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
        #input { border: none; padding: 0 1rem; flex: 1; border-radius: 2rem; margin: 0.25rem; }
        #input:focus { outline: none; }
        #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
        #messages { margin-bottom: 40px; }
      </style>
    </head>
    <body>
      <h1>即時聊天室</h1>
      <ul id="messages"></ul>
      <form id="form" action="">
        <input id="input" autocomplete="off" placeholder="輸入訊息..." /><button>送出</button>
      </form>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        var socket = io();
        var messages = document.getElementById('messages');
        var form = document.getElementById('form');
        var input = document.getElementById('input');

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
          }
        });

        socket.on('chat message', function(msg) {
          var item = document.createElement('li');
          item.textContent = msg;
          messages.appendChild(item);
          window.scrollTo(0, document.body.scrollHeight);
        });
      </script>
    </body>
    </html>
  `);
});

// Socket.io 連線處理
io.on('connection', (socket) => {
  console.log('用戶已連接');
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('用戶已離線');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運行在 port ${PORT}`);
});
