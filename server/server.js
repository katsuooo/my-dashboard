const express = require('express'); // expressの追加
const cors = require('cors'); // corsミドルウェアの追加
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongo_ip = require('./mongo/mongo_ip')
const logger_client = require('./log/logger_client.js')

const app = express(); // expressアプリケーションの作成
console.log('mongo-ip',mongo_ip())
// CORS設定
let corsOptions = {};

if (process.env.NODE_ENV === 'development') {
  corsOptions = {
    origin: 'http://localhost:3058', // クライアントのオリジン
    credentials: true, // クッキーを使用する場合に必要
  };
} else {
  corsOptions = {
    origin: 'http://kdesign.sytes.net:3058', // クライアントのオリジン
    credentials: true, // クッキーを使用する場合に必要
  };
}

// CORSミドルウェアの使用
//app.use(cors(corsOptions));

// Viteでビルドされた静的ファイルをサーブするための設定
app.use(express.static('../dist')); // 'dist' フォルダを静的ファイルのルートに設定

// HTTPサーバーの作成とSocket.ioの初期化
const httpServer = createServer(app);
const io = new Server(httpServer, {
  // options
});

// MongoDB関連のモジュール読み込み
//const mongoStaffSche = require('./mongoStaffSche.js');
//const mongoStaffHen = require('./mongoStaffHen.js');
//const mongoUserSche = require('./mongoUserSche.js');
//const mongoAttendanceSalary = require('./mongoAttendanceSalary.js'); // 経費読み込み

const socketEvent = require('./socketEvent.js')

// Socket.ioのイベント設定
io.on("connection", (socket) => {
  console.log('server-connect');
  socketEvent(socket)   // event振り分け
  socket.on('TEST', () => {
    console.log('com-TEST receive');
  });
  socket.on('LOG_CLIENT', (mes) => {
    logger_client.info(mes) 
  });
  /*
  socket.on('READ_STAFF_SCHE', (date) => {
    console.log('read-staff-sche', date);
    if (date === null) {
      return;
    }
    mongoStaffSche.readStaffSche(date, socket);
  });
  socket.on('CHANGE_STAFF_SCHE', (socketdata) => {
    console.log('change-staff-sche', socketdata);
    if (socketdata === null) {
      return;
    }
    mongoStaffHen.henStaffSche(socketdata, socket);
  });
  socket.on('READ_USER_SCHE', (date) => {
    console.log('read-user-sche', date);
    if (date === null) {
      return;
    }
    mongoUserSche.readUserSche(date, socket);
  });
  socket.on('READ_CALCED_EXPENCE', (appDate) => {
    console.log('server-r-calc', appDate);
    mongoAttendanceSalary.calcSalary(appDate, socket);
  });
  socket.on('READ_BALANCE', (appDate) => {
    console.log('read-balance-sche', appDate);
    if (appDate === null) {
      return;
    }
    mongoAttendanceSalary.readBalance(appDate, socket);
  });
  socket.on('MONGO_TEST', (url) => {
    console.log('mongo-test-emit', url);
  });
  */
});

// サーバーの起動
httpServer.listen(3058, () => {
  console.log('\nnode-server running ..... port 3058\n');
});
