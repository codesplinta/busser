'use strict';

const getHttpClientDriverName = (httpClientDriver) => {
  if (!httpClientDriver || typeof httpClientDriver !== 'function') {
    return 'unknown'
  }

  const stringifiedDriver = httpClientDriver.toString()

  if (httpClientDriver.name === 'fetch' 
      && stringifiedDriver.startsWith('function fetch() {\n')
        && stringifiedDriver.endsWith('[native code]\n}')) {
    return 'fetch'
  }

  if (httpClientDriver.name === 'wrap'
      && typeof httpClientDriver.Axios === 'function') {
    return 'axios'
  }
}


export { getHttpClientDriverName  }
