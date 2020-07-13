/**
 * 对首页需要展示的数据做定时缓存，将数据保存到云数据库中。
 * 部署时需要配置环境变量：
 *  - token: API的token
 *  - appId: API的appId
 */
import { init, database } from 'wx-server-sdk';
import request from 'request-promise';
init()
const db = database();
const colYjs = db.collection('yjs');
let result;

//发送请求获取数据
const yjsCounters = async(event) => {
  const host = "http://apis.ynu.edu.cn/do/api/call/count_yjs";
  //token通过获取此云函数的环境变量获得，通过云开发控制台，配置此云函数名为token的键值对环境变量
  const token = process.env.token;
  const appId = process.env.appId;
  let options = {
    uri: `${host}`,
    method: 'POST',
    json: true,
    headers: {
      "accessToken": token,
      "appId": appId,
      "Content-Type": "application/json"
    },
    body: event
  };
  try {
    return await request(options);
  } catch (err) {
    return {
      ret: -1,
      msg: err
    };
  }
}

//在发送请求前先获取数据库的信息
const getYjsCounter = async() => {
  const yjs = colYjs.get();
  await yjs.then((res) => {
    result = res;
  });
}

//通过数据库得到的数据，传参获取相应数据并存入到数据库中
const cRequest = async() => {
  for (let i = 0; i < result.data[0].yjsCounter.length; i++) {
    for (let j = 0; j < result.data[0].yjsCounter[i].list.length; j++) {
      let counter = await yjsCounters(result.data[0].yjsCounter[i].list[j].conditions);
      result.data[0].yjsCounter[i].list[j].counter = counter.dataSet[0].RESULT;
      //把获取到的数量，按序存入到数据库中的counters集合中
      colYjs.doc(result.data[0]._id).update({
        data: {
          yjsCounter: result.data[0].yjsCounter
        }
      });
    }
  }
}

//云函数入口函数
export asyncfunction main(event, context) {
  await getYjsCounter();
  await cRequest();
}