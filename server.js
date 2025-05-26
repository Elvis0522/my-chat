const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // 部署後改為你的前端網址
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('用戶已連接');
  
  socket.on('message', (msg) => {
    io.emit('message', msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運行在 port ${PORT}`);
});
