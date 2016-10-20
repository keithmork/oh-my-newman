/*
 * @Author: mojinrong
 * @Date:   2016-09-29 17:43:38
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-12 17:43:55
 */

/* eslint-disable no-eval, no-undef, valid-typeof, no-return-assign */

const counter = `Loop ${iteration}: `;

// Functions
const assertEqual = (name, actual, expected) => {
  tests[`${counter} Expect ${name} to equal ${expected}, actual: ${actual}`] = actual === expected;
};
const assertNotEqual = (name, actual, expected) => {
  tests[`${counter} Expect ${name} NOT to equal ${expected}, actual: ${actual}`] = actual !== expected;
};
const assertType = (name, value, type) => {
  if (type === 'array') {
    tests[`${counter} Expect ${name} to be ${type}: ${value}`] = Array.isArray(value);
  } else {
    tests[`${counter} Expect ${name} to be ${type}: ${value}`] = typeof value === type;
  }
};
const assertNotType = (name, value, type) => {
  tests[`${counter} Expect ${name} NOT to be ${type}: ${value}`] = typeof value !== type;
};
const assertTimeout = (name, actual, timeout) => {
  tests[`${counter} Expect ${name} to be no more than ${timeout} ms, actual: ${actual} ms`] = actual <= timeout;
};
const assertOk = msg => tests[`${counter} ${msg}`] = true;
const assertFail = msg => tests[`${counter} ${msg}`] = false;
const printInfo = (msg, value) => tests[`${counter} [INFO] ${msg}: ${value}`] = true;

// Assertions
const { _title, _description, _statusCode, _timeout, _mustHave, _mustNotHave } = data;

if (_title) printInfo('Title', _title);
if (_description) printInfo('Description', _description);

printInfo('Request params', JSON.stringify(request.data));
if (responseTime) assertTimeout('response time', responseTime, _timeout || 15000);
if (responseCode) assertEqual('status code', responseCode.code, _statusCode || 200);

let json;
try {
  json = JSON.parse(responseBody);
} catch (err) {
  assertFail('Expect response body to be valid JSON');
  printInfo('Response body', responseBody);
  console.error(err);
}

const getElementValue = (elementPath) => {
  let value;
  try {
    // careful!
    value = eval(elementPath);
  } catch (err) {
    console.error(`No ${elementPath} in response body. Check your test case.`);
    printInfo('Response body', responseBody);

    return undefined;
  }

  return value;
};

if (json) {
  if (_mustHave && _mustHave.length) {
    _mustHave.forEach((item) => {
      const { elementPath, type, value } = item;
      if (elementPath) {
        const actualValue = getElementValue(elementPath);
        if (actualValue !== undefined) {
          if (type) {
            assertType(elementPath, actualValue, type);
          }
          if (value !== '') {
            assertEqual(elementPath, actualValue, value);
          }
        } else {
          assertFail(`${counter} Expect response body to have: ${elementPath}`);
          printInfo('Response body', responseBody);
        }
      }
    });
  }

  if (_mustNotHave && _mustNotHave.length) {
    _mustNotHave.forEach((item) => {
      const { elementPath, type, value } = item;
      if (elementPath) {
        const actualValue = getElementValue(elementPath);
        if (actualValue !== undefined) {
          if (value !== '') {
            assertNotEqual(elementPath, actualValue, value);
          } else if (type) { // 只有在value为空而type不为空时才判断类型不等，避免复制粘贴时没改过来
            assertNotType(elementPath, actualValue, type);
          } else {
            assertFail(`${counter} Expect response body NOT to have: ${elementPath}, actual: ${actualValue}`);
            printInfo('Response body', responseBody);
          }
        } else {
          assertOk(`${counter} Expect response body NOT to have ${elementPath}.`);
        }
      }
    });
  }
}
