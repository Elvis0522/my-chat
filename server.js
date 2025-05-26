const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = []; // 用來儲存聊天室訊息

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <title>即時聊天室</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f6f6f6;}
        #chat-container { max-width: 600px; margin: 0 auto; height: 100vh; display: flex; flex-direction: column;}
        #messages { flex: 1; overflow-y: auto; padding: 10px; margin: 0; list-style: none;}
        #messages li { background: #fff; margin-bottom: 8px; padding: 10px; border-radius: 8px; word-break: break-all;}
        #form { display: flex; padding: 10px; background: #eee; }
        #input { flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ccc; font-size: 16px;}
        #form button, #clearBtn { margin-left: 8px; border: none; background: #007bff; color: #fff; border-radius: 20px; padding: 10px 16px; font-size: 16px;}
        #form button:active, #clearBtn:active { background: #0056b3;}
        #clearBtn { position: fixed; top: 10px; right: 10px; z-index: 100; }
        @media (max-width: 600px) {
          #chat-container { height: 100dvh; }
          #clearBtn { top: 60px; right: 10px; }
        }
      </style>
    </head>
    <body>
      <div id="chat-container">
        <button id="clearBtn">清空聊天室</button>
        <ul id="messages"></ul>
        <form id="form" autocomplete="off">
          <input id="input" placeholder="輸入訊息..." autocomplete="off" />
          <button type="submit">送出</button>
        </form>
      </div>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        const messages = document.getElementById('messages');
        const clearBtn = document.getElementById('clearBtn');

        // 自動滾動到底部
        function scrollToBottom() {
          messages.scrollTop = messages.scrollHeight;
        }

        // 新增訊息到畫面
        function addMessage(msg) {
          const item = document.createElement('li');
          item.textContent = msg;
          messages.appendChild(item);
          scrollToBottom();
        }

        // 送出訊息
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (input.value.trim()) {
            socket.emit('chat message', input.value.trim());
            input.value = '';
          }
        });

        // 接收訊息
        socket.on('chat message', function(msg) {
          addMessage(msg);
        });

        // 初次連線時取得全部訊息
        socket.on('init messages', function(msgs) {
          messages.innerHTML = '';
          msgs.forEach(addMessage);
          scrollToBottom();
        });

        // 清空聊天室
        clearBtn.addEventListener('click', function() {
          if(confirm('確定要清空聊天室嗎？')) {
            socket.emit('clear chat');
          }
        });

        socket.on('clear chat', function() {
          messages.innerHTML = '';
        });

        // 自動聚焦輸入框
        input.focus();
      </script>
    </body>
    </html>
  `);
});

// Socket.io 處理
io.on('connection', (socket) => {
  // 初次連線時傳送現有訊息
  socket.emit('init messages', messages);

  // 收到新訊息
  socket.on('chat message', (msg) => {
    messages.push(msg);
    io.emit('chat message', msg);
  });

  // 收到清空聊天室指令
  socket.on('clear chat', () => {
    messages = [];
    io.emit('clear chat');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
