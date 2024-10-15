/**
 * 
 * 勤怠時間からサラリーを計算
 * 
 * 
 * 
 */
var mongodb = require('mongodb');
const nameShaping = require('./nameShaping.js')
const calcMonthWage = require('./calcMonthWage.js')
const dayjs = require('dayjs')
const mongo_ip = require('../mongo/mongo_ip.js')

const MONGOINFO = {
    url: 'mongodb://' + mongo_ip(),
}

const read_mem_graphd = require('./read_mem_graphd.js')
const add_all_member = require('./add_all_member.js')
/**
 * 
 * 今月人件費の計算
 * 
 * 
 * @param {*} db 
 * @param {*} attend_col 
 * @param {*} socket 
 * @param {*} returnEventName 
 */
/**
 * 
 * 渡邉百合子 {
  _id: 633e8250b65867fb4c2af8a9,
  name: '渡邉百合子',
  attendEdit: [
    { date: '5', aEditIn: '10:00', aEditMemo: null, aEditOut: '16:00' },
    { date: '6', aEditIn: '09:30', aEditOut: '16:00' },
    { date: '8', aEditIn: '14:30', aEditOut: '17:00' },
    { date: '9', aEditIn: '12:00', aEditOut: '17:00' },
    { date: '10', aEditIn: '10:00', aEditOut: '17:15' },
    { date: '12', aEditIn: '09:45', aEditOut: '16:00' },
    { date: '13', aEditIn: '09:30', aEditOut: '16:00' },
    { date: '14', aEditIn: '13:00', aEditOut: '16:15' },
    { date: '15', aEditIn: '14:30', aEditOut: '16:00' },
    { date: '16', aEditIn: '13:00', aEditOut: '17:00' },
    { date: '20', aEditIn: '10:00', aEditOut: '16:00' },
    { date: '21', aEditIn: '13:00', aEditOut: '17:15' },
    { date: '22', aEditIn: '14:30', aEditOut: '16:30' },
    { date: '24', aEditIn: '09:30', aEditOut: '17:15' },
    { date: '27', aEditIn: '13:00', aEditOut: '16:00' },
    { date: '28', aEditIn: '13:00', aEditOut: '17:00' },
    { date: '29', aEditIn: '14:30', aEditOut: '17:00' },
    { date: '30', aEditIn: '10:30', aEditOut: '18:00' },
    { date: '1', aEditIn: '11:00', aEditOut: '16:00', aEditMemo: null },
    { date: '2', aEditIn: '10:00', aEditOut: '16:00', aEditMemo: null },
    { date: '7', aEditIn: '14:30', aEditOut: '16:00', aEditMemo: null }
  ]
}
 */
/**
 * 
 {
  _id: 6390446e7c68f5703676b1fb,
  name: '渡邉百合子',
  category: '医療ケアスタッフ',
  date: '2022-08-31T15:00:00.000Z',
  taishoku_date: null,
  birthday: null,
  family: '',
  medicalHistory: '',
  primaryCareDoctor: '',
  address: '',
  telephone: '',
  email: '',
  sorting: 7,
  payType: '時給',
  wage: 2100
}
 * 
 */
/**
 * 
 * @param {*} dbName        
 * @param {*} attend_col 
 * @param {*} socket 
 * @param {*} returnEventName 
 */
var calcSalary = async(dbName, attend_col, socket, returnEventName) => {
    var client;
    var waged = []
    try{
        client = await mongodb.MongoClient.connect(MONGOINFO.url);
        const db = await client.db(dbName);
        let collection = await db.collection('member');
        let stuff = await collection.find().toArray();
        let atend_collection = await db.collection(attend_col);
        let atend_d = await atend_collection.find().toArray();
        stuff.forEach((d) => {
            //stuff list loop
            const stuff_db_name = nameShaping(d.name)
            atend_d.forEach((ad) => {
                //atend_edit loop
                if(stuff_db_name === ad.name){
                    var month_wage_d = calcMonthWage.calcMonthWage(d.payType, d.wage, ad.attendEdit)
                    waged.push({name:stuff_db_name, payType:d.payType, wage_unit:d.wage, wage_time:month_wage_d.time, month_wage:month_wage_d.wage, days:month_wage_d.days})
                }
            })
        })
        //socket.emit('READ_CALCED_EXPENCE_DONE', waged)
    }catch(err){
        console.log(err);
    }finally{
        try{
            client.close();
            return waged
        }catch(err){
            console.log(err)
        }
    }
}

/**
 * 
 * 収支パラメタデフォルト値
 * 
 * 戻り値は配列
 * 
 * @param {*} appDate 
 * @returns 
 */
function getBalanceParam(appDate){
    const yearMonthStr = appDate.year.toString() + '-' + appDate.month.toString().padStart(2,'0')
    var expence = [{title:'', value:0},{title:'', value:0},{title:'', value:0},{title:'', value:0},{title:'', value:0}]
    var income = {subsidy:29500, user_cumulative: 0}
    return [{yearMonthStr:yearMonthStr, expence:expence, income:income}]
}

/**
 * 
 * 累積利用日数の計算
 * 
 * 
 */
/*
{
    _id: 6357637317d32f5654c594ea,
    day: '30',
    sches: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object]
    ],
    ...



}
*/
function cumulate(monthly_user_sche, today){
    let use_day_num = 0
    for(let i=0; i<monthly_user_sche.length; i++){
        var scheDay = parseInt(monthly_user_sche[i].day)
        if(scheDay <= today){
            //use_day_num += monthly_user_sche[i].sches.length
            monthly_user_sche[i].sches.forEach((m) => {
                if(m.place === 'シュシュ'){
                    if(m.cancel === 'none'){
                        use_day_num += 1
                    }
                }else if(m.place === 'カシュカシュ'){
                    if(m.cancel === 'none'){
                        use_day_num += 1
                    }
                }
            })

        }
    }
    return use_day_num
}
/*
var jsontemp = {
    yearMonthStr:'',
    expence:[{title:'',value:0},{title:'',value:0},{title:'',value:0},{title:'',value:0},{title:'',value:0}],
    income:
}
*/
/**
 * 
 * balanceデータのread
 * 
 * 
 * @param {} dbName 
 * @param {*} balance_col 
 * @param {*} socket 
 * @param {*} returnEventName 
 */
var readBalance = async(dbName, colName, appDate, socket, returnEventName) => {
    var client;
    try{
        console.log('read-balance-2')
        client = await mongodb.MongoClient.connect(MONGOINFO.url );
        const db = await client.db(dbName);
        let collection = await db.collection(colName);
        console.log('app-date',appDate)
        const ym_str = appDate.year + '-' + appDate.month.toString().padStart(2,'0');
        var balanceOneMonth = await collection.find({yearMonthStr:ym_str}).toArray();
        console.log('oneMonth',balanceOneMonth)
        if (balanceOneMonth.length === 0){
            balanceOneMonth = getBalanceParam(appDate)
        }
        //get monthly user cumulative
        const cs_sche_colName = 'cs_' + appDate.year + appDate.month.toString().padStart(2,'0');
        let monthly_user_sche = await db.collection(cs_sche_colName).find().toArray()
        let user_cumulative = 0
        if(monthly_user_sche.length !== 0){
            console.log('go-cumulate')
            user_cumulative = cumulate(monthly_user_sche, appDate.date)
        }else{
            //初期データ
            //balanceOneMonth.push(getBalanceParam())
            balanceOneMonth = getBalanceParam()
        }
        console.log('return-cumulate', balanceOneMonth)
        balanceOneMonth[0].income.user_cumulative = user_cumulative   // balanceOneMonthを編集すると後続の命令が実行されない
        console.log('socket-on', balanceOneMonth)
        socket.emit(returnEventName, balanceOneMonth[0])
        console.log('socket-on-ok', returnEventName)
    }catch(err){
        console.log('err',err)
    }finally{
        try{
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}


var writeBalance = async(dbName, colName, balance, socket) => {
    var client;
    try{
        console.log('write-balance', balance)
        client = await mongodb.MongoClient.connect(MONGOINFO.url );
        const db = await client.db(dbName);
        let collection = await db.collection(colName);
        console.log('b-month', balance.yearMonthStr)
        let balanceOneMonth = await collection.find({yearMonthStr:balance.yearMonthStr}).toArray();
        //let balanceOneMonth = await collection.find({yearMonthStr:'2023-01'}).toArray()
        console.log('balance-one-read', balanceOneMonth)
        //console.log('balance-one-read-2', balanceOneMonth[0].expence)
        if (balanceOneMonth.length === 0){
            d = await collection.insertOne(balance)
            console.log('new-write')
        }else{
            //既存にupsert
            console.log('replace')
            let d = await collection.updateOne(
                {yearMonthStr: balance.yearMonthStr },
                {$set:{yearMonthStr:balance.yearMonthStr, expence:balance.expence, income:balance.income}}
            )
        }
    }catch(err){
        console.log('write-err', err)
    }finally{
        try{
            client.close();
        }catch(err){
            console.log(err)
        }
    }
}


/**
 * 
 * export
 * 
 */
var member_graph = {
    get_graph_data: async (term, socket) => {
        console.log('get_graph_data',term)
        //appDate = { year: 2022, month: 9, date: 10, day: '土' }
        // attend, attend_editを1月分読む。appMonth = yyyy-m
        //const ym = appDate.year + appDate.month.toString().padStart(2,'0');
        //const attendEditName = 'attend_edit_' + term.start_ym
        //let memg = calcSalary('shushu', attendEditName, socket, 'READ_CALCED_EXPENCE_RESULT')
        let memg = await read_mem_graphd(term)
        memg.push(add_all_member(memg))         // 全メンバ加算データを追加する
        socket.emit('RET_GET_GRAPH_D', memg)
    },
    get_graph_data_with_GNO: async (termAndGNO, socket) => {
        //graph noつきの処理　GNOはそのまま返信に添付する
        console.log('get_graph_data',termAndGNO)
        let memg = await read_mem_graphd(termAndGNO)
        memg.push(add_all_member(memg))         // 全メンバ加算データを追加する
        socket.emit('RET_GET_GRAPH_D_WITH_GNO', {memg:memg, GNO:termAndGNO.GNO})
    },
    readBalance: (appDate, socket) => {
        console.log('read-balance', appDate)
        const colName = 'balance'
        readBalance('shushu', colName, appDate, socket, 'READ_BALANCE_RESULT')
    },
    writeBalance: (balance, socket) => {
        const colName = 'balance'
        writeBalance('shushu', colName, balance, socket)
    }
}

module.exports = member_graph;
