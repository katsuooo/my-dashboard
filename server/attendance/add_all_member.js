/**
 * 
 * 
 * 全メンバ加算データの作成
 * 
 * 
 * 
 */
/**
 * 全メンバ加算データ配列の初期化
 * 
 * memgからtermを取り出して、0値のデータを作成
 */
function init_all_mem_d(memg){
    let all_mem_d_ini = []
    let ym = []
    memg[0].forEach((m) => {
        //term内ym配列の作成
        ym.push(m.date)
    })
    ym.forEach((y) => {
        let add_all_mem = {}
        add_all_mem.name = ''
        add_all_mem.date = y
        add_all_mem.month_wage = 0
        add_all_mem.wage_time = 0
        add_all_mem.days = 0
        all_mem_d_ini.push(JSON.parse(JSON.stringify(add_all_mem)))
    })
    return all_mem_d_ini
}
/**
 * 
 * 出勤なしの場合はitemが存在しないので、チェックし、ない場合は0を返す
 * 
 * @param {*} jd 
 */
function check_item(jd){
    if (jd === undefined){
        return 0
    }
    return jd
}
/**
 * 
 * メンバグラフデータ配列
 * [
 *      [
 *          {name:, month_wage, days, ...}
 *      ],
 *      ...
 * ]
memg 配列のデータ部
{
date: "202308"  　　　// no-use
days: 16
month_wage: 289850
name: "渡邉百合子"
payType: "時給"       // no-use
wage_time: 131.75
wage_unit: 2200       // no-use
}
*/
 /* 
 * @param {*} memg 
 */
function add_all_d(memg){
    let all_mem_d = JSON.parse(JSON.stringify(init_all_mem_d(memg)))  //全メンバの加算データ[{name, month_wage, days, }, ...]
    all_mem_d.forEach((person) => {
        //初期化したデータに各人の数値を加算していく。名前もいれる。
        //aは一人分の期間内月合計データ
        memg.forEach((one_mem_dict) => {
            //グラフデータの１階層目のメンバー数の配列
            one_mem_dict.forEach((parson_month_json, index) => {
                //2階層目の {name, month_wage...} の各人の月加算データ
                //indexはym配列のindex
                all_mem_d[index].name = '全加算値'
                all_mem_d[index].days += check_item(parson_month_json.days)
                all_mem_d[index].month_wage += check_item(parson_month_json.month_wage)
                all_mem_d[index].wage_time += check_item(parson_month_json.wage_time)
            })
        })
    })
    return JSON.parse(JSON.stringify(all_mem_d))
}

module.exports = add_all_d