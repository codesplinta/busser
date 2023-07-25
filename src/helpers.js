'use strict';

import empty from "lodash/isEmpty";

const getHttpClientDriverName = (httpClientDriver) => {
  if (!httpClientDriver ||
        typeof httpClientDriver !== 'function') {
    return 'unknown'
  }

  const stringifiedDriver = httpClientDriver.toString()

  if (httpClientDriver.name === 'fetch' &&
        stringifiedDriver.startsWith('function fetch() {\n') &&
          stringifiedDriver.endsWith('[native code]\n}')) {
    return 'fetch'
  }

  if (httpClientDriver.name === 'wrap' &&
        typeof httpClientDriver.Axios === 'function') {
    return 'axios'
  }
 
  return ''
};

const throttleFilterCallbackRoutine = (
  routine,
  routineArgs,
  interval = 500
) => {
  let shouldFire = true;
  return function callback() {
    if (shouldFire) {
      const result = routine.call(null, ...routineArgs);
      shouldFire = false;
      setTimeout(() => {
        shouldFire = true;
      }, interval);
      return result;
    }
    return () => undefined;
  };
};

const extractPropertyValue = (
  objectProperty = "",
  object = {}
) => {
  const delimeter = ".";
  const value = objectProperty.includes(delimeter)
    ? objectProperty.split(delimeter).reduce((subObject, prop) => {
        const result =
          typeof subObject === "object" ? subObject[prop] : subObject;
        return result;
      }, object)
    : object[objectProperty];
  return value;
};

const toUniqueItemList = (initialList = [], propertyKey = "") => {
  let initialListCounter, innerLoopCounter, finalListItem, initialListItem;

  const finalList = [];

  resetLabel: for (
    initialListCounter = 0;
    initialListCounter < initialList.length;
    ++initialListCounter
  ) {
    for (
      innerLoopCounter = 0;
      innerLoopCounter < finalList.length;
      ++innerLoopCounter
    ) {
      finalListItem = finalList[innerLoopCounter];
      finalListItem =
        propertyKey !== "" && typeof finalListItem !== "string"
          ? extractPropertyValue(propertyKey, finalListItem)
          : finalListItem;
      initialListItem = initialList[initialListCounter];
      initialListItem =
        propertyKey !== "" && typeof initialListItem !== "string"
          ? extractPropertyValue(propertyKey, initialListItem)
          : initialListItem;

      if (finalListItem === initialListItem) continue resetLabel;
    }
    finalList.push(initialList[initialListCounter]);
  }

  return finalList;
};

const toDuplicateItemList = (initialList = [], propertyKey = "") => {
  let tempList = [],
    finalList = [],
    innerLoopCounter,
    initialListCounter,
    finalListItem,
    initialListItem;

  for (
    initialListCounter = 0;
    initialListCounter < initialList.length;
    initialListCounter++
  ) {
    for (
      innerLoopCounter = 0;
      innerLoopCounter < tempList.length;
      innerLoopCounter++
    ) {
      finalListItem = tempList[innerLoopCounter]
      finalListItem =
        propertyKey !== "" && typeof finalListItem !== "string"
          ? extractPropertyValue(propertyKey, finalListItem)
          : finalListItem;
      initialListItem = initialList[initialListCounter]
      initialListItem =
        propertyKey !== "" && typeof initialListItem !== "string"
          ? extractPropertyValue(propertyKey, initialListItem)
          : initialListItem;
      if (finalListItem === initialListItem) {
        finalList.push(tempList[innerLoopCounter]);
      }
    }
    tempList.push(initialList[initialListCounter]);
  }
  return finalList;
};

function calculateDiffFor (source, extra, exclude = []) {
  const result = {};
  
  if (!exclude)	exclude = [];
  
  for (const prop in source) {
    if (source.hasOwnProperty(prop) && prop !== "__proto__") {
      if (exclude.indexOf(source[prop]) == -1) {

        // check if `extra` has prop
        if (!extra.hasOwnProperty(prop)) {
          result[prop] = source[prop];
        }

        // check if prop is object and 
        // NOT a JavaScript engine object (i.e. __proto__), if so, recursive diff
        else if (source[prop] === Object(source[prop])) {
          const difference = calculateDiffFor(source[prop], extra[prop]);

          if (Object.keys(difference).length > 0) {
            result[prop] = difference;
          }
        }

        // check if `source` and `extra` are equal
        else if (source[prop] !== extra[prop]) {
          if (source[prop] === undefined)
            result[prop] = "undefined";
          if (source[prop] === null)
            result[prop] = null;
          else if (typeof source[prop] === "function")
            result[prop] = "function";
          else if (typeof source[prop] === "object")  
            result[prop] = "object";
          else
            result[prop] = source[prop];
        }
      }
    }
  }

  return result;
}

const stateValuesHasDiff = (nextState, prevState, excludedKeys = []) => {
  return !empty(calculateDiffFor(nextState, prevState, excludedKeys))
};

export { getHttpClientDriverName, extractPropertyValue, toDuplicateItemList, stateValuesHasDiff, throttleFilterCallbackRoutine, toUniqueItemList  }
