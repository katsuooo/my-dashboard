/**
 * staff schedule 変更
 * 
 * 
 */
var mongodb = require('mongodb');
//const MONGOINFO = require('../config/config').MONGOINFO;
const calcMonthWage = require('./calcMonthWage.js')
const dayjs = require('dayjs')
const mongoStaffSche = require('./mongoStaffSche.js')
const mongo_ip = require('./mongo_ip.js')

const MONGOINFO = {
    url: 'mongodb://' + mongo_ip(),
}


/*
MongoClient.connect(MONGO_URL, function(err, db) {
    if(err){
        return console.error(err);
    }
    var collection = db.collection(colName);
    collection.find({day:searchDay}).toArray(function(err, docs) {
        if (err) {
            return console.error(err);
        };
  //console.log('one upsert: db1', docs);
  var newData;
  if(docs.length !== 0){	// 既存データあり
          docs.forEach(function(doc) {
      var match_index = -1;
      doc.sches.forEach(function(sche, index){
        if(sche.name === socketdata.name){
          match_index = index;
        }
      });
      if(match_index !== -1){
        doc.sches[match_index] = JSON.parse(JSON.stringify(socketdata));
        newData = JSON.parse(JSON.stringify(doc.sches));
      }else{
        newData = JSON.parse(JSON.stringify(doc.sches));
        newData.push(socketdata);
      }
　　　　　　　　　　  });
  }else{
    newData = [];
    newData.push(socketdata);
  }
  //console.log('one upsert: db2', newData);
  collection.update(
      {day: searchDay},
      {$set: {sches: newData}},
      {upsert: true},
      function(err, result) {
                 　　if (err) {
                  　　return console.error(err);
          　　}
          socket.emit('memscheUpsertOne_done');
       db.close();
        });
});
});
*/

/**
 * 
 * 既存データの変更
 */
/*
mongodb/memsche format
{
    name: '宮田浩子',
    stime: '10:00',
    etime: '14:45',
    place: 'シュシュ',
    holiday: false,
    desired_stime: '10:00',
    desired_etime: '14:45'
  },
*/
/*
socketdata = {name:,stime:,etime:}
*/
function set_new(docs, socketdata){
    var newData;
    if(docs.length !== 0){	// 既存データあり
        docs.forEach(function(doc) {
            var match_index = -1;
            doc.sches.forEach(function(sche, index){
                if(sche.name === socketdata.name){
                    match_index = index;
                }
            });
            if(match_index !== -1){
                doc.sches[match_index].stime = socketdata.stime
                doc.sches[match_index].etime = socketdata.etime
                newData = JSON.parse(JSON.stringify(doc.sches));
            }else{
                newData = JSON.parse(JSON.stringify(doc.sches));
                newData.push(socketdata);
            }
        });
    }else{
      newData = [];
      newData.push(socketdata);
    }
    return newData
}

/**
 * 
 * 新データをdbに書き込み
 * 
 * @param {*} socketdata 
 * @param {*} socket 
 */
var henStaffSche = async(socketdata, socket) => {
    const appDate = socketdata.appDate
    const dbName = 'shushu'
    const colName = 'ms_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0')
    const eventName = 'STAFF_SCHE_HEN_RESULT'
    var client;
    try{
        //既存データの読み出し
        client = await mongodb.MongoClient.connect(MONGOINFO.url );
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
            //socket.emit(eventName, {});
        }else{
            //socket.emit(eventName, d[0]);
        }
        const new_sche = set_new(d, socketdata)
        /*
        await collection.update(
            {day: appDate.date.toString()},
            {$set: {sches: new_sche}},
            {upsert: true},
            function(err, result) {
                if (err) {
                    return console.error(err);
                }
                socket.emit('memscheUpsertOne_done');
                db.close();
            });*/
        const err = await collection.updateOne(
            {day: appDate.date.toString()},
            {$set: {sches: new_sche}},
            {upsert: true}
        )
            /*
                function(err, result) {
                    if (err) {
                        return console.error(err);
                    }
                    socket.emit('memscheUpsertOne_done');
                    db.close();
                });*/
        if(err){
            console.log(err)
        }
    }catch(err){
        console.log(err);
    }finally{
        try{
            client.close();
            mongoStaffSche.readStaffSche(socketdata.appDate, socket)
        }catch(err){
            console.log(err)
        }
    }

}


const mongoStaffHen = {
    henStaffSche: (appDate, socket) => {
        henStaffSche(appDate, socket)
    }
}
module.exports = mongoStaffHen