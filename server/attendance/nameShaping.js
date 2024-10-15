/**
 * 
 * 名前の整形
 * 
 * スペースを除く
 * 
 */
/**
 * 
 * @param {*} original_name 
 */
function nameShaping(original_name){
    var name = original_name
    while(name.includes(' ')){
        name = name.replace(' ','')
    }
    while(name.includes('　')){
        name = name.replace('　','')
    }
    return name
}



module.exports = nameShaping;