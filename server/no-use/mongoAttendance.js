/**
 * attendance interface
 * 
 * 
 * 
 */
/**
 * format
 * 
 * {
 *      date: 'd'
 *      attendance:[
 *          {name:'', in:'xx:xx', out:'xx:xx'},
 *          {name:'', in:'', out:''},
 *          {name:'', in:'', out:''}
 *      ]
 * }
 * 
 * 
 */
var mongodb = require('mongodb');
//const MONGOINFO = require('../config/config').MONGOINFO;
const nameShaping = require('./nameShaping')
const mongo_ip = reqire('./mongo_ip.js')

const MONGOINFO = {
    url: 'mongodb://' + mongo_ip(),
}


/**
 * 本日の出退勤データを探す
 * 
 * @param {*} d = [{date:'',attendance:[]},....]
 */
function getTodayAttendance(d, date){
    if(d.length === 0){
        return false
    }
    var today = {}
    d.forEach( (x) => {
        if(x.date === date){
            today = x.attendance
        }
    })
    return today
}
/**
 * 本日の出退勤データを探す
 * 
 * @param {*} d = [{day:'',sches:[]},....]
 */
function getTodayMsche(d, date){
    if(d.length === 0){
        return false
    }
    var today = {}
    d.forEach( (x) => {
        if(x.day === date){
            today = x.sches
        }
    })
    return today
}
/**
 * 
 * 出退勤データのパース
 * 
 * attendance:
 *   date:''
 *   attendance:[
 *     {name:'', in:'', out:''}
 *   ]
 * 
 * 
 */
function parseAttendance(att, name){
    console.log('att-', att, typeof(att))
    var d = {name:name, in:'', out:''}
    att.forEach((a) => {
        if(a.name === name){
            console.log(a)
            if(!(a.hasOwnProperty('in'))){
                a.in = ''
            }
            if(!(a.hasOwnProperty('out'))){
                a.out = ''
            }
            d = JSON.parse(JSON.stringify(a))
        }
    })
    return d
}
/**
 * 
 * attend-editリストから本日出勤者のデータを抽出する
 * {
 *   name:''
 *   
 * }
 * 
 * 
 * 
 */
/**
 * 出退勤データのリード
 * 
 * @param {*} dbName 
 * @param {*} colName 
 * @param {*} appDate 
 * @param {*} socket 
 * @param {*} eventName 
 */
var readAttendance = async(dbName, colName, appDate, name, socket, eventName) => {
    console.log('read-attendance')
    var client;
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );

        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        let d = await collection.find({date:appDate.date}).toArray();
        console.log('attendance',d)
        if(d.length === 0){
            var today = false
        }else{
            var today = getTodayAttendance(d, appDate.date)
        }
        console.log('today', today)
        if(today === false){
            socket.emit(eventName, {name:name, in:'', out:''});
        }else{
            const attendance = parseAttendance(today, name)
            console.log('att-', name, attendance)
            socket.emit(eventName, attendance);
        }
    }catch(err){
        console.log(err);
    }finally{
        try{
            console.log('attendance-read-pass')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}



/**
 * 
 * @param {*} dbName 
 * @param {*} colName 
 * @param {*} appDate 
 * @param {*} socket 
 * @param {*} eventName 
 */
var readAttendanceAll = async(dbName, colName, appDate, socket, eventName) => {
    var client;
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );
       
        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        let d = await collection.find().toArray();
        console.log('attendance',d)
        socket.emit(eventName, d);
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

/**
 * 勤怠アテンダンスwrite
 * 
 * upsert: trueで初書き込みもこの関数で実行できる
 * 
 * 
 * @param {*} dbName 
 * @param {*} colName 
 * @param {*} date 
 * @param {*} q 
 */
var writeAttendance = async(dbName, colName, date, q, socket, eventName) => {
    var client;
    console.log('write-data',q)
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );

        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        const xDate = date
        let dd = await collection.find({date:date}).toArray();
        console.log('dd', dd, typeof(dd))
        if(dd.length === 0){
            var today = false
        }else{
            var today = getTodayAttendance(dd, date)
        }
        console.log('today-', today)// attendance配列
        let match = false
        if(today !== false){
            today.forEach((x) => {
                if(x.name === q.name){
                    match = true
                }
            })
        }
        if(match === false){
            //新規
            let d = await collection.updateOne(
                //{date:parseInt(xDate)},
                {date:xDate},
                {$addToSet:{'attendance':{name:q.name,in:q.in,out:q.out}}},
                {upsert:true}
            );
        }else{
            //既存にupsert
            let d = await collection.updateOne(
                //{date:parseInt(xDate), 'attendance.name': q.name },
                {date:xDate, 'attendance.name': q.name },
                {$set:{'attendance.$.in': q.in, 'attendance.$.out': q.out}},
            );
        }
        socket.emit(eventName)
    }catch(err){
        console.log(err);
    }finally{
        try{
            console.log('attendance-read-pass')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}
/**
 * day atenndance, day msche both read
 * 
 * add attendance-edit data
 * 
 * @param {*} dbName 
 * @param {*} col_atten 
 * @param {*} col_msche 
 * @param {*} xdate      string
 * @param {*} socket 
 * @param {*} eventName 
 */
var readAttendanceScheDay = async(dbName, col_atten, col_msche, xdate, socket, eventName) => {
    var client;
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );

        const db = await client.db(dbName);
        let collection = await db.collection(col_atten);
        let d = await collection.find({date: xdate}).toArray();
        if(d.length === 0){
            var today = []
        }else{
            var today = getTodayAttendance(d, xdate)
        }
        collection = await db.collection(col_msche);
        d = await collection.find({day: xdate}).toArray();
        if(d.length === 0){
            var todayMs = []
        }else{
            var todayMs = getTodayMsche(d, xdate)
        }
        //console.log('staffSche-today', todayMs)
        //collection = await db.collection
        todayMs.forEach((ms) => {
            console.log(ms.name)
        })
        socket.emit(eventName, {sche: todayMs, attendance: today})
    }catch(err){
        console.log(err);
    }finally{
        try{
            //console.log('attendance-read-pass')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}
/**
 * 
 * @param {*} dbName 
 * @param {*} col_atten 
 * @param {*} col_msche 
 * @param {*} xdate 
 * @param {*} socket 
 * @param {*} eventName 
 */
/**
 *   
attendEdit 
{
    name: '渡邉百合子',
    attendEdit: { date: '15', aEditIn: '14:30', aEditOut: '16:00' }
}
 */
var readAttendanceScheDay_add_edit = async(dbName, col_atten, col_msche, col_attendEdit, xdate, socket, eventName) => {
    var client;
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );


        const db = await client.db(dbName);
        let collection = await db.collection(col_atten);
        let d = await collection.find({date: xdate}).toArray();
        if(d.length === 0){
            var today = []
        }else{
            var today = getTodayAttendance(d, xdate)
        }
        collection = await db.collection(col_msche);
        d = await collection.find({day: xdate}).toArray();
        if(d.length === 0){
            var todayMs = []
        }else{
            var todayMs = getTodayMsche(d, xdate)
        }
        var attend_edit = [];
        collection = await db.collection(col_attendEdit)
        for(let i=0; i<todayMs.length; i++){
            var name = todayMs[i].name 
            name = nameShaping(name)
            d = await collection.find({name:name}).toArray();
            for(let j=0; j<d.length; j++){
                //j:attend-edit-loop
                if(d[j].attendEdit === undefined){
                    continue
                }
                for(let k=0; k<d[j].attendEdit.length; k++){
                    if(d[j].attendEdit[k].date === xdate){
                        attend_edit.push({name:todayMs[i].name, attendEdit: d[j].attendEdit[k]})
                    }
                }
            }
        }
        socket.emit(eventName, {sche: todayMs, attendance: today, attendEdit: attend_edit})
    }catch(err){
        console.log(err);
    }finally{
        try{
            //console.log('attendance-read-pass')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}
/**
 * 月コレクションにDayデータを書き込み
 * 
 * 
 * @param {*} dbName 
 * @param {*} colName 
 * @param {*} date 
 * @param {*} a
 */
var writeAttendanceDay = async(dbName, colName, a) => {
    var client;
    console.log('write-data-month',a)
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );

        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        //await collection.drop()
        await collection.insertOne(a)
    }catch(err){
        console.log(err);
    }finally{
        try{
            console.log('attendance-write-month')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}
/**
 * 出退勤データの削除
 * 
 * 
 * 
 * @param {*} dbName 
 * @param {*} colName 
 * @param {*} xDate >>> number
 * @param {*} name 
 */
var deleteAttendance = async(dbName, colName, xDate, name, socket, commandName) => {
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url,  {useUnifiedTopology:true});
        client = await mongodb.MongoClient.connect(MONGOINFO.url, {useUnifiedTopology:true});

        const db = await client.db(dbName);
        const collection = await db.collection(colName);
        let d = await collection.find({date: xDate.toString()}).toArray()
        if(d.length === 0){
            return
        }
        if(!(d[0].hasOwnProperty('attendance'))){
            return
        }
        var newh = []
        d[0].attendance.forEach( (a) => {
            console.log('names', a.name, name)
            if(a.name !== name){
                newh.push(a)
            }
        })
        await collection.updateOne(
            {date: xDate.toString()},
            {$set: {attendance: newh}},
            {upsert: true}
        )
        socket.emit(commandName)
    }catch(err){
        console.log(err);        
    }finally{
        try{
            console.log('attendance-delete-one')
            client.close();
        }catch(err){
            console.log(err)
        }
    }
    

}

/**
 * day atenndance, day msche both read
 * 
 * 
 * @param {*} dbName 
 * @param {*} col_atten 
 * @param {*} xdate      string
 * @param {*} socket 
 * @param {*} eventName 
 */
 var readAttendEditScheDay = async(dbName, col_atten, xdate, socket, eventName) => {
    console.log('read-attend-edit')
    var client;
    try{
        //client = await mongodb.MongoClient.connect(MONGOINFO.url );
        client = await mongodb.MongoClient.connect(MONGOINFO.url );

        const db = await client.db(dbName);
        let collection = await db.collection(col_atten);
        let d = await collection.find().toArray();
        if(d.length === 0){
            var today = []
        }else{
            var today = d
        }
        //msche readから当日のメンバリストを作成
        collection = await db.collection(col_msche);
        d = await collection.find({day: xdate}).toArray();
        if(d.length === 0){
            var todayMs = []
        }else{
            var todayMs = getTodayMsche(d, xdate)
        }
        //var attendEditToday = 
        socket.emit(eventName, {attendEdit: today})
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

/**
 * attendance interface
 */
var mongoAttendance = {
    readAttendance: (appDate, name, socket) => {
        const colName = 'attend_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        readAttendance('shushu', colName, appDate, name, socket, 'READ_ATTENDANCE_RESULT')
    },
    writeAttendance: (obj, socket) => {
        const colName = 'attend_' + obj.appDate.year.toString() + obj.appDate.month.toString().padStart(2,'0');
        console.log('obj.q', obj)
        writeAttendance('shushu', colName, obj.appDate.date, obj.d, socket, 'WRITE_ATTENDANCE_DONE')
    },
    readAttendanceAll: (appDate, socket) => {
        const colName = 'attend_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        readAttendanceAll('shushu', colName, appDate, socket, 'READ_ATTENDANCE_ALL_RESULT')
    },
    writeAttendanceDay: (obj, socket) => {
        const colName = 'attend_' + obj.appDate.year.toString() + obj.appDate.month.toString().padStart(2,'0');
        console.log('obj.q', obj)
        writeAttendanceDay('shushu', colName, obj.d)
    },
    readAttendanceScheDay: (appDate, socket) => {
        console.log('read-attendance', appDate)
        const col_attend = 'attend_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        const col_msche = 'ms_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        //readAttendanceScheDay('shushu', col_attend, col_msche, appDate.date.toString(), socket, 'READ_ATTENDANCE_SCHE_DAY_RESULT')    
        const col_attendEdit = 'attend_edit_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        readAttendanceScheDay_add_edit('shushu', col_attend, col_msche, col_attendEdit, appDate.date.toString(), socket, 'READ_ATTENDANCE_SCHE_DAY_RESULT')        
    },
    henAttendance: (obj, socket) => {
        // obj = {appDate: , d: {name, in, out}}
        const colName = 'attend_' + obj.appDate.year.toString() + obj.appDate.month.toString().padStart(2,'0');
        writeAttendance('shushu', colName, obj.appDate.date.toString(), obj.d, socket, 'WRITE_ATTENDANCE_DONE')
    },
    delAttendance: (obj, socket) => {
        // obj = {appDate: , name}
        const colName = 'attend_' + obj.appDate.year.toString() + obj.appDate.month.toString().padStart(2,'0');
        deleteAttendance('shushu', colName, obj.appDate.date, obj.name, socket, 'WRITE_ATTENDANCE_DONE')
    },
    readAttendEditScheDay: (appDate, socket) => {
        console.log('read-attend-edit-sche-day ', appDate)
        const col_attend = 'attend_edit_' + appDate.year.toString() + appDate.month.toString().padStart(2,'0');
        readAttendEditScheDay('shushu', col_attend, appDate.date.toString(), socket, 'READ_ATTEND_EDIT_SCHE_DAY_RESULT')        
    },
}



module.exports = mongoAttendance;