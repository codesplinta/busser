'use strict';

const getHttpClientDriver = () => {
  return { httpClientDriverName, fetch }
}

const getDefaultHttpServerUrl = (url) => {
  return url || ''
}

export { getHttpClientDriver, getDefaultHttpServerUrl }
