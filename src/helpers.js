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

export { getHttpClientDriverName, extractPropertyValue, toDuplicateItemList, toUniqueItemList  }
