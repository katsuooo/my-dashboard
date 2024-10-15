/*
 node server.js でnode socket server を起動する
*/
const cors = require('cors'); // corsミドルウェアの追加

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

const mongoStaffSche = require('./mongoStaffSche.js')
const mongoStaffHen = require('./mongoStaffHen.js')
const mongoUserSche = require('./mongoUserSche.js')
//const mongoAttendance = require('./mongoAttendance.js')    //経費読み込み
const mongoAttendanceSalary = require('./mongoAttendanceSalary.js')    //経費読み込み

const socketEvent = require('./socketEvent.js')

let corsOptions = {}
/**
 * 
 * アクセス元のURLを設定 (不用?)
 * 
 */
if (process.env.NODE_ENV === 'development') {
  corsOptions = {
    origin: 'http://localhost:3058', // クライアントのオリジン
    credentials: true, // クッキーを使用する場合に必要
  };  
}else{
  corsOptions = {
    origin: 'http://kdesign.sytes.net:3058', // クライアントのオリジン
    credentials: true, // クッキーを使用する場合に必要
  };  
}


io.on("connection", (socket) => {
  console.log('server-connect')
  socketEvent(socket)   // event振り分け
  socket.on('TEST', () => {
    console.log('com-TEST recieve')
  })
  socket.on('READ_STAFF_SCHE', (date) => {
    console.log('read-staff-sche', date)
    if (date === null){
      return
    }
    mongoStaffSche.readStaffSche(date, socket)
  })
  socket.on('CHANGE_STAFF_SCHE', (socketdata) => {
    console.log('change-staff-sche', socketdata)
    if (socketdata === null){
      return
    }
    mongoStaffHen.henStaffSche(socketdata, socket)
  })
  socket.on('READ_USER_SCHE', (date) => {
    console.log('read-user-sche', date)
    if (date === null){
      return
    }
    mongoUserSche.readUserSche(date, socket)
  })
  socket.on('READ_CALCED_EXPENCE', (appDate) => {
    console.log('server-r-calc',appDate)
    mongoAttendanceSalary.calcSalary(appDate, socket)
  })
  socket.on('READ_BALANCE', (appDate) => {
    console.log('read-balance-sche', appDate)
    if (appDate === null){
      return
    }
    mongoAttendanceSalary.readBalance(appDate, socket)
  })
  socket.on('MONGO_TEST', () => {
    console.log('mongo-test-emit')
  })
});

//test
/*
console.log('test-on')
const date = { year: 2023, month: 8, date: 3, day: '木' }
const socket = {}
mongoStaffSche.readStaffSche(date, socket)
*/
httpServer.listen(3058);

console.log('\nnode-server running ..... port 3058\n')

