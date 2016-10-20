/*
 * @Author: mojinrong
 * @Date:   2016-09-28 10:31:28
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-12 17:21:43
 */

/* eslint-disable no-eval, no-undef, no-unused-vars, valid-typeof, no-return-assign */

const setEnvVar = (name, value) => postman.setEnvironmentVariable(name, value);

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomValue = list => list[randInt(0, list.length - 1)];

// 随机手机
const randomMobile = `14${randInt(100000000, 999999999)}`;
setEnvVar('randomMobile', randomMobile);

// 随机2-6字姓名
const charsInName = ['赵', '钱', '孙', '李', '王', '张'];
const numOfChars = randInt(2, 6);
let randomName = '';
for (let i = 0; i < numOfChars; i += 1) {
  const index = randInt(0, 5);
  randomName += charsInName[index];
}
setEnvVar('randomName', randomName);

// UUID
const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/x/g, () => (Math.floor(Math.random() * 16)).toString(16))
  .replace(/y/g, () => (Math.floor(Math.random() * 4 + 8)).toString(16));
setEnvVar('uuid', uuid);

// 随机设备token（推送服务商提供）
const charList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
let deviceToken = '';
for (let i = 0; i < 64; i += 1) {
  deviceToken += getRandomValue(charList);
}
setEnvVar('randomDeviceToken', deviceToken);

// 随机设备名
const deviceList = ['ios', 'android'];
setEnvVar('randomDevice', getRandomValue(deviceList));

// 随机行政区划
const divisionList = ['北京市', '上海市', '天津市', '重庆市', '广东省 深圳市', '广东省 广州市', '新疆维吾尔自治区 克孜勒苏柯尔克孜自治州'];
setEnvVar('randomDivision', getRandomValue(divisionList));
