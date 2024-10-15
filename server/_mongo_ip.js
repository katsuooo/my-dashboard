/**

  mongodbのipアドレスの取得


*/


/**
 * get url
 */
function getUrl(){
  //return io.request.connection.remoteAddress
  //var web_server = window.location.host
  //var backend = web_server.split(':')[0] + ':3058'
  //var backend = web_server.split(':')[0]
  //backend = '192.168.0.178'
  backend = 'localhost'
  //backend = '192.168.0.178:27017'
  console.log(backend)
  return backend
}
/*
const os = require('os');

(async () => {
  const netInfos = os.networkInterfaces();
  const en0 = netInfos['en0'];

  const ipv4 = en0.find(({family}) => family === 'IPv4');

  console.log(ipv4.address);
})();
*/
/*
*/
function mongo_ip(){
  //var ip = getUrl()
  //return 'mongodb://' + ip + ''
  return getUrl() + ':27017'
}


module.exports = mongo_ip