/**
 * 
 * 
 * 
 * mem graph dataの読み取りテスト
 * 
 * 
 * 
 */

var memg = require('./attendance/member_graph.js')
//var memg = require('./member_graph.js')

let term = {start_ym:'202308',end_ym:'202407'}
memg.get_graph_data(term)



