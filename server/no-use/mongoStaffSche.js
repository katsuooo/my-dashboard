/*
スタッフスケジュールの調整
*/
var mongodb = require('mongodb');
//const MONGOINFO = require('../config/config').MONGOINFO;
const calcMonthWage = require('./calcMonthWage.js')
const dayjs = require('dayjs')

/*


appDate: { year: 2023, month: 9, date: 7, day: '木' }

ms_yyyymmdd:
{
  "_id": {
    "$oid": "64f30d5fb7a3ccb5c6f2a1f2"
  },
  "day": "2",
  "sches": [
    {
      "name": "栗岡さやか",
      "stime": "",
      "etime": "",
      "desired_stime": "",
      "desired_etime": "",
      "place": "シュシュ",
      "holiday": false,
      "desired_holiday": true
    }
  ]
}
*/
const mongo_ip = require('./mongo_ip')

const MONGOINFO = {
    url: 'mongodb://' + mongo_ip(),
}
/*

staff-scheのリード
当日のスタッフシフト希望、決定シフトのデータを読み込む

*/
var readStaffSche = async(appDate, socket) => {
    const dbName = 'shushu'
    const colName = 'ms_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0')
    const eventName = 'STAFF_DAYSCHE_RESULT'
    var client;
    try{
        console.log('read-staff-sche-mongoip', MONGOINFO.url)
        client = await mongodb.MongoClient.connect(MONGOINFO.url);
        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        let d = await collection.find({day:appDate.date.toString()}).toArray();
        if(d[0].sches){
            var today = true
        }else{
            var today = false
        }
        if(today === false){
            console.log('today is nodata:')
            socket.emit(eventName, {});
        }else{
            socket.emit(eventName, d[0]);
        }
    }catch(err){
        console.log(err);
    }finally{
        try{
            client.close();
        }catch(err){
            console.log(err)
        }
    }

}


const mongoStaffSche = {
    readStaffSche: (appDate, socket) => {
        console.log('appDate', appDate)
        readStaffSche(appDate, socket)
    }
}
module.exports = mongoStaffSche