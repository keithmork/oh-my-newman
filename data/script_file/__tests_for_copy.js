/*
 * @Author: Keith Mo
 * @Date:   2016-09-28 10:31:28
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-10 19:20:33
 */

/* eslint-disable no-undef, no-unused-vars, valid-typeof, no-return-assign */

/* Example response
 On success - resultCode is 1:
 { "data": { "foobar": [1, 2, 3], "foo": "qwertyuiopasdfghjklzxcvbnm", "bar": 3 }, "resultCode": 1 }

 On failure - resultCode is not 1:
 { "resultMsg": "hello world", "resultCode": 100 }
 or:
 { "detailMsg": "meow meow meow", "resultCode": 123456 }
 */

const assertEqual = (name, actual, expected) => {
  tests[`Expect ${name} to equal ${expected}, actual: ${actual}`] = actual === expected;
};
const assertNotEqual = (name, actual, expected) => {
  tests[`Expect ${name} not to equal ${expected}, actual: ${actual}`] = actual !== expected;
};
const assertType = (name, value, type) => {
  if (type === 'array') {
    tests[`Expect ${name} to be ${type}: ${value}`] = Array.isArray(value);
  } else {
    tests[`Expect ${name} to be ${type}: ${value}`] = typeof value === type;
  }
};
const assertTimeout = (name, actual, time) => {
  const timeout = time || 10000;
  tests[`Expect ${name} to be no more than ${timeout} ms, actual: ${actual} ms`] = actual <= timeout;
};
const assertFail = msg => tests[msg] = false;
const printInfo = (msg, value) => tests[`[INFO] ${msg}: ${value}`] = true;
const setEnvVar = (name, value) => postman.setEnvironmentVariable(name, value);

// Common
printInfo('Request params', JSON.stringify(request.data));
assertTimeout('response time', responseTime, environment.RESPONSE_TIMEOUT);
assertEqual('status code', responseCode.code, 200);

let json;
try {
  json = JSON.parse(responseBody);
} catch (err) {
  assertFail('Expect response body to be valid JSON');
  printInfo('Response body', responseBody);
  console.error(err);
}

// Project specific
if (json) {
  const { resultCode, resultMsg, detailMsg } = json;
  assertEqual('resultCode', resultCode, 1);

  if (resultMsg) printInfo(resultMsg);
  if (detailMsg) printInfo(detailMsg);
}

// API specific
const expected = {
  // foo: environment.FOO,
  // bar: 1,
};

if (json && json.data) {
  // assertType('data', data, 'object');

  // const { foobar, foo, bar, } = json.data;
  // assertType('foobar', foobar, 'array');
  // assertEqual('foo', foo, expected.foo);
  // assertNotEqual('bar', bar, expected.bar);

  // setEnvVar('name', 'string value');
} else {
  assertFail('Expect response body to have data');
}
