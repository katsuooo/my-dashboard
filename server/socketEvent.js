/**
 * 
 * 
 *  socket event
 * 
 * 
 */
//var get_member_g = require('./get_member_g.js')
var member_graph = require('./attendance/member_graph.js')
var logger = require('./log/logger.js')
/**
 * socket parse
 */
function socketEvent(socket) {
    socket.on('GET_MEMBER_G', (term) => {
        console.log('get-member-g', term.start_ym, term.end_ym)
        logger.info(`socket-on GET_MEMBER_GG ${term.start_ym},${term.end_ym}`)
        //get_member_g(term)
        member_graph.get_graph_data(term, socket)
    }),
    socket.on('GET_MEMBER_G_WITH_GNO', (termAndGNO) => {
        console.log('get-member-g', termAndGNO.start_ym, termAndGNO.end_ym)
        logger.info(`socket-on GET_MEMBER_GG ${termAndGNO.start_ym},${termAndGNO.end_ym}`)
        //get_member_g(term)
        member_graph.get_graph_data_with_GNO(termAndGNO, socket)
    })
}

module.exports = socketEvent