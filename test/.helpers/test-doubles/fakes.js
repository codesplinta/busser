export const fakeStorageFactory = () => (function () {
    let __keys = [];
    let __map: = {};

    const storageFake = new Proxy(Object.freeze({
      setItem (key, value) {
        if (typeof key !== "string") {
          return;
        }

        if (typeof value !== "string") {
          return;
        }

        __keys.push(key);
        __map[key] = value;
      },
      removeItem (key) {
        const index = __keys.indexOf(key);
        if (index === -1) {
          return;
        }
        __keys.splice(index, 1);
        delete __map[key];
      },
      key (keyIndex) {
        if (typeof keyIndex !== "number") {
          return null;
        }
        return __keys[keyIndex] || null;
      },
      length: -1,
      clear () {
        __keys = [];
        __map = {};
      },
      getItem (key) {
        if (typeof key !== "string") {
          return null;
        }
        return __map[key] || null;
      }
    }),
    {
      get: (target, property) => {
        if (typeof target[property as string] !== "number") {
          return target[property as string];
        } else {
          if (property === "length") {
            return __keys.length;
          }
        }
      },
      set: (target, prop) => {
        if (Boolean(target[prop])) {
          throw new Error(`${prop}: readonly`);
        }
      }
    });

    return storageFake;
  }());
