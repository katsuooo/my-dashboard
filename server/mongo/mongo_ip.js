/**

  mongodbのipアドレスの取得


*/

const os = require('os');

/**
 * 
 * 全IPアドレスの取得
 * @returns 
 * 
 */
function getLocalIPAddressAll() {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddresses.push({ interface: name, address: iface.address });
      }
    }
  }

  return ipAddresses.length > 0 ? ipAddresses : 'Local IPs not found';
}

//console.log('auto-get',getLocalIPAddressAll());

/**
 * 
 * localアドレスの取得
 * 
 * @returns 
 * 
 * 
 */
/* 取得サンプル
auto-get [
  { interface: 'イーサネット 2', address: '192.168.0.178' },
  { interface: 'vEthernet (Default Switch)', address: '172.20.112.1' }
]*/
//ubuntu ip 192.168.1.92
function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];
  for (const name of Object.keys(interfaces)) {
    console.log('name:', name)
    for (const iface of interfaces[name]) {
      console.log('name', name, iface)
      if (iface.family === 'IPv4' && !iface.internal) {
        //ipAddresses.push({ interface: name, address: iface.address });
        if(name.includes('イーサネット') || name.includes('wlp') || name.includes('lo')){
          return iface.address
        }
      }
    }
  }

  return 'not-found';
}


/**
 * 
 * osを調べる
 * 
 * @returns 
 * 
 */
function detectOS() {
    const platform = os.platform();
    console.log('os:', platform)
    if (platform === 'win32') {
        return 'Windows';
    } else if (platform === 'linux') {
        // さらに詳細な判定が必要な場合は、`os.release()`などを使う
        const release = os.release();
        if (release.includes('Ubuntu')) {
            return 'Ubuntu';
        }
        return 'Linux';
    } else {
        return 'Other';
    }
}

/**
 * 
 * osによりipをfixする
 * 
 * dockerでは常にubuntuになる
 */
function getipFromOs(){
  let osName = detectOS()
  let ipa = '192.168.1.92'
  if (osName === 'windows'){
    ipa = '192.168.0.178'
  }
  return ipa
}
/**
 * get url
 */
function getUrl(){
  //return io.request.connection.remoteAddress
  //var web_server = window.location.host
  //var backend = web_server.split(':')[0] + ':3058'
  //var backend = web_server.split(':')[0]
  //let backend = getLocalIPAddresses() >>>> うまくとれない/docker環境なのでnetwork-mode:hostでか？
  let backend = getipFromOs()
  if(backend === 'not-found'){
    console.log('backend-not-found')
    backend = '192.168.1.92'
  }
  //backend = '192.168.0.178'   //windowsで動作する場合コメントオフ
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