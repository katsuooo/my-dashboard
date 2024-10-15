/**
 * 
 * 
 * userスケジュールの読み出し
 * 
 * 
 * 
 */
var mongodb = require('mongodb');
//const MONGOINFO = require('../config/config').MONGOINFO;
const calcMonthWage = require('./calcMonthWage.js')
const dayjs = require('dayjs')
const mongo_ip = require('./mongo_ip.js')

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


const MONGOINFO = {
    //url: 'mongodb://localhost',
    url: 'mongodb://' + mongo_ip()
}
/*

User-scheのリード
当日のスタッフシフト希望、決定シフトのデータを読み込む

*/
var readUserSche = async(appDate, socket) => {
    ('User-day-sche', appDate)
    const dbName = 'shushu'
    const colName = 'cs_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0')
    const eventName = 'USER_DAYSCHE_RESULT'
    var client;
    try{
        console.log(MONGOINFO.url)
        client = await mongodb.MongoClient.connect(MONGOINFO.url );
        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        let d = await collection.find({day:appDate.date.toString()}).toArray();
        if(d[0].sches){
            var today = true
        }else{
            var today = false
        }
        console.log('today-data-exist', today)
        if(today === false){
            console.log('today is nodata:')
            socket.emit(eventName, {});
        }else{
            console.log('event-on')
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


const mongoUserSche = {
    readUserSche: (appDate, socket) => {
        console.log('appDate', appDate)
        readUserSche(appDate, socket)
    }
}
module.exports = mongoUserSche