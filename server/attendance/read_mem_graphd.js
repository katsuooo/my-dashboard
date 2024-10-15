/**
 * 
 * 
 * 
 * member graph dataをmongodbからよむ
 * 
 * term: start_ym, end_ym  読み込むデータの年月の期間
 * 
 * 
 */
var mongodb = require('mongodb');
const nameShaping = require('./nameShaping')
const mongo_ip = require('../mongo/mongo_ip.js')
const MONGOINFO = {
    url: 'mongodb://' + mongo_ip(),
}
const calcMonthWage = require('./calcMonthWage.js')
/**
 * 
 * @param {*} dbName        
 * @param {*} attend_col 
 * @param {*} socket 
 * @param {*} returnEventName 
 */
var read_mem_month = async(dbName, attend_col) => {
    var client;
    var waged = []
    try{
        client = await mongodb.MongoClient.connect(MONGOINFO.url);
        const db = await client.db(dbName);
        let collection = await db.collection('member');
        let stuff = await collection.find().toArray();
        let atend_collection = await db.collection(attend_col);
        let atend_d = await atend_collection.find().toArray();
        /*
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
        */
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
 * term.start_ym < term.end_ym
 * をチェックする
 * 
 * @param {*} term 
 */
function checkTerm(term){
    if(parseInt(term.start) < parseInt(term.end)){
        return true
    }
    return false
}
/**
 * 
 * @param {*} dateStr 
 */
function conv_ym_to_datetime(dateStr){
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    
    // JavaScriptのDateは月が0から始まるため、-1する
    const dateObj = new Date(year, month - 1);
    
    // 出力
    console.log(dateObj);
}
/**
 * 日付の比較 
 */

function compaireDate(){
    const date1 = new Date(2024, 7, 1);  // 2024年8月1日
    const date2 = new Date(2023, 7, 1);  // 2023年8月1日

    if (date1.getTime() > date2.getTime()) {
        console.log("date1 は date2 より後です");
    } else if (date1.getTime() < date2.getTime()) {
        console.log("date1 は date2 より前です");
    } else {
        console.log("日付は同じです");
    }
}
/**
 * 
 * ymデータのインクリメント
 * 
 * yyyymmをint変換した数値に１を加算する。
 * mm = 12の場合は桁上がりする
 * 
 */
function add_ym(ym_int){
    var month = ym_int % 100
    if (month >= 12){
        var year = ym_int - month
        year += 100   //年度桁上がり
        return year + 1    // month=1 
    }
    return ym_int + 1
}
/**
 * 
 * member listの読込み
 * 
 */
async function read_mem_list(){
    var client;
    var stuff = []
    try{
        client = await mongodb.MongoClient.connect(MONGOINFO.url);
        const db = await client.db('shushu');
        let collection = await db.collection('member');
        let stuff = await collection.find().toArray();
        return stuff
    }catch(err){
        console.log(err);
    }finally{
        try{
            console.log('memlist',stuff)
            client.close();
            //return stuff
        }catch(err){
            console.log(err)
        }
    }
}
/**
 * 
 * mengoからmem dataを読み込む
 * 
 * attend_edit_yyyymmデータを１か月分読み込む
 * 
 */
/**
 * 
 * @param {*} ym_str 
 * @returns 
 */
async function read_mem_raw(ym_str){
    var client;
    var waged = []
    try{
        client = await mongodb.MongoClient.connect(MONGOINFO.url);
        const db = await client.db('shushu');
        //let collection = await db.collection('member');
        //let stuff = await collection.find().toArray();
        const attend_col = 'attend_edit_' + ym_str
        //console.log('read-attend_edit_', ym_str, typeof(ym_str))
        let atend_collection = await db.collection(attend_col);
        let atend_d = await atend_collection.find().toArray();
        return atend_d
    }catch(err){
        console.log(err);
    }finally{
        try{
            client.close();
            //return waged
        }catch(err){
            console.log(err)
        }
    }
}

/**
 * 
 * d:member-list
 * atend_d: attend_yyyymmデータ
 */
/*
attend_yyyymm : { date: '1', attendance:[ {name: in: out:}....] }

member-listの各メンバーごとにデータを抽出する
*/
function gen_mem_d(stuff, atend_d){
    let waged = []
    let all_parson_data = []
    stuff.forEach((d) => {
        //stuff list loop
        const stuff_db_name = nameShaping(d.name)
        let one_parson_month = []
        atend_d.forEach((ad) => {
            let one_parson_a_day = []
            // one month while term 
            //atend_d term間データの配列
            let one_parson_data = []     
            ad.forEach((aday) => {
                filtered = aday.attendance.filter(item => item.name === stuff_db_name)
                filter_d = {date: aday.date, in: filtered.in, out: filtered.out}
                one_parson_a_day.push(filter_d)
            })
            one_parson_month.push(one_parson_a_day)
        })
        all_parson_data.push({name:stuff_db_name, attendance:one_parson_month})
        //filtered = atend_d.filter(item => item.attendance && item.attendance.some(attendItem => attendItem.name === '谷川緒弥'))
        
    })
    return all_parson_data
}
/**
 * 
 */
function gen_wage(stuff, atend_d){
    waged = []
    //fs.writeFileSync('atend_d.json',JSON.stringify(atend_d,null,2),'utf-8')
    stuff.forEach((d) => {
        //stuff list loop
        const stuff_db_name = nameShaping(d.name)
        atend_d[0].forEach((ad) => {
            //atend_edit loop
            if(stuff_db_name === ad.name){
                var month_wage_d = calcMonthWage.calcMonthWage(d.payType, d.wage, ad.attendEdit)
                waged.push({name:stuff_db_name, payType:d.payType, wage_unit:d.wage, wage_time:month_wage_d.time, month_wage:month_wage_d.wage, days:month_wage_d.days})
            }
        })
    })
    return waged
}
/**
 * 
 * @param {*} term //グラフ表示期間
 */
/**
 * 
wage計算データ
days = 1
month_wage = 4900
name = '岡本典子'
payType = '時給'
wage_time = 3.5
wage_unit = 1400
 */
/*
wage-data
waged.push(
{name:stuff_db_name, payType:d.payType, wage_unit:d.wage, wage_time:month_wage_d.time, month_wage:month_wage_d.wage, days:month_wage_d.days})

name毎に収集

*/
var fs = require('fs')
async function read_mem_graphd(term){
    if(checkTerm(term)){
        //termの期間そチェック
        return
    }
    var mem_list = await read_mem_list()    //member-listの読込み
    //console.log('mem-list', mem_list)
    //console.log(term)
    var now_ym = parseInt(term.start_ym)        //初期ym yyyymmを設定
    var end_ym_int = parseInt(term.end_ym)      //endの yyyymmをintに
    var wage_d = []
    for(let i=now_ym; i<=end_ym_int; i=add_ym(i)){
        // 期間内のアテンドデータを読み込み、wageを計算する(graph-data)
        console.log(i)
        let mem_d = []
        mem_d.push(await read_mem_raw(String(i)))
        wage_d.push({ date: String(i), wage: gen_wage(mem_list, mem_d) })      // attend_edit data
    }
    //console.log(mem_d)
    //console.log(mem_d.length)
    //console.log('wage',wage_d[0].wage)
    //console.log('wage-len',wage_d.length)
    //fs.writeFileSync('wage_d.json',JSON.stringify(wage_d,null,2),'utf-8')
    /**
     * 月単位のwage計算データをグラフ用に人ごとに集計する
     */
    let all_staff_wage = []
    mem_list.forEach((m) => {
        const stuff_db_name = nameShaping(m.name)
        let one_staff_wage = []
        wage_d.forEach((wd) => {
            // wd = {date:yyyymm, wage:[{},...]}
            //stuff_db_nameにnameが一致するデータを収集
            let one_staff_d = {}
            one_staff_d = wd.wage.filter(person => person.name === stuff_db_name) //name=stuff_db_nameを含むjsonが[]に入る
            //console.log(stuff_db_name,one_staff_d)
            //one_staff_d[0].date = wd.date   // yyyymm 月集計データなので日付を含まない
            //one_staff_json = JSON.parse(JSON.stringify(one_staff_d[0]))
            one_staff_json = one_staff_d[0]
            //console.log('osj',one_staff_json, wd)
            if(one_staff_json === undefined){
                //勤務データなしのスタッフの場合
                one_staff_json = {}
                one_staff_json.name = stuff_db_name
                one_staff_json.date = wd.date
            } else {
                one_staff_json.date = wd.date   // yyyymm 月集計データなので日付を含まない
            }
            one_staff_wage.push(JSON.parse(JSON.stringify(one_staff_json)))
        })
        all_staff_wage.push(one_staff_wage)
    })
    console.log(all_staff_wage)
    return all_staff_wage
}


module.exports = read_mem_graphd