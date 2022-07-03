'use strict';

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

const extractPropertyValue = (
  objectProperty = "",
  object = {},
  delimeter = "."
) => {
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
  let finalList,
    initialListCounter,
    innerLoopCounter,
    finalListItem,
    initialListItem;
  finalList = [];

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
      finalListItem =
        propertyKey !== ""
          ? finalList[innerLoopCounter][propertyKey]
          : finalList[innerLoopCounter];
      initialListItem =
        propertyKey !== ""
          ? initialList[initialListCounter][propertyKey]
          : initialList[initialListCounter];

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
      finalListItem =
        propertyKey !== ""
          ? tempList[innerLoopCounter][propertyKey]
          : tempList[innerLoopCounter];
      initialListItem =
        propertyKey !== ""
          ? initialList[initialListCounter][propertyKey]
          : initialList[initialListCounter];
      if (finalListItem === initialListItem) {
        finalList.push(tempList[innerLoopCounter]);
      }
    }
    tempList.push(initialList[initialListCounter]);
  }
  return finalList;
};

export { getHttpClientDriverName, toDuplicateItemList, toUniqueItemList  }
