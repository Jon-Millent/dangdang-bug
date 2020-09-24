const axios = require('axios')

const request = axios.create({
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  }
})

request.interceptors.response.use(
  response => {  //成功请求到数据
    let rawData = null
    if (response.status !== 200) {
      rawData = {code: 1, err: response.data, msg: '请求失败', isSuccess: false}
    } else {
      rawData = response.data
    }
    rawData.isSuccess = rawData.status && rawData.status.code === 0
    return rawData
  },
  error => {  //响应错误处理
    return {
      error,
      code: 500,
      msg: '请求失败：' + (error.response ? error.response.status : '未知错误')
    }
  }
)

function get(api, params = {}, config = {}){
  let beforeConfig = {}

  return request(Object.assign(
    {
      url: api,
      method: 'GET',
      params: Object.assign(params, {t: new Date().getTime()}),
    },
    beforeConfig
  ))
}


function post(api, params = {}, config = {}){
  let beforeConfig = {}

  return request(Object.assign(
    {
      url: api,
      method: 'POST',
      data: params
    },
    beforeConfig
  ))
}

function go (data) {
  return get('http://e.dangdang.com/media/api.go', data)
}

// 获取目录
function getPcMediaInfo(data) {
  /*
  need
  * epubID
  */
  return go(Object.assign({
    action: 'getPcMediaInfo',
    consumeType: 1,
    platform: 3,
    deviceType: 'Android',
    deviceVersion: '5.0.0',
    platformSource: 'DDDS-P',
    fromPaltform: 'ds_android',
    deviceSerialNo: 'html5',
    clientVersionNo: '5.8.4',
    wordSize: 2,
    style: 2
  }, data))
}

// 获取章节信息
function getPcChapterInfo(data) {
  /*
  need
  * epubID
  * chapterID
  * pageIndex
  */
  return go(Object.assign({
    action: 'getPcChapterInfo',
    consumeType: 1,
    platform: 3,
    deviceType: 'Android',
    deviceVersion: '5.0.0',
    platformSource: 'DDDS-P',
    fromPaltform: 'ds_android',
    deviceSerialNo: 'html5',
    clientVersionNo: '5.8.4',
    wordSize: 2,
    style: 2,
  }, data))
}

module.exports = {
  get,
  post,
  go,
  getPcMediaInfo,
  getPcChapterInfo
}
