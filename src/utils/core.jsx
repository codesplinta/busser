import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  useContext
} from "react";
import debounce from "lodash/debounce";

import {
  stateValuesHasDiff,
  toUniqueItemList,
  extractPropertyValue,
  throttleFilterCallbackRoutine
} from "../helpers.js";

const BrowserStorageContext = React.createContext(null);
const TextFilterAlgorithmsContext = React.createContext(null);

export function useTextFilteredList(
  { text = "", page = 1, list },
  {
    filterTaskName = "specific",
    fetchRemoteFilteredList = () => Promise.resolve([]),
    filterUpdateCallback = (controller) => () => void controller
  }
) {
  /* @HINT: Fetch all the default text search algorithm functions from React context */
  const algorithms = useContext(TextFilterAlgorithmsContext);
  /* @HINT: Select the text search algorithm function chosen by the client code (via `filterTaskName` argument) for text query purposes */
  const filterTextAlgorithmRunner =
    algorithms !== null ? algorithms[filterTaskName] : () => [];

  /* @HINT: Setup the search query controller values - values that control the processing of the text search */
  const [controller, setController] = useState({
    text,
    isLoading: false,
    list,
    page
  });
  /* @HINT: Use a debounce function to batch keystrokes together and make calls to the server only after typing has ceased */
  const delayedFetchRemoteFilteredList = useRef(
    debounce((searchTerm, listItemKeys) => {
      if (typeof fetchRemoteFilteredList === "function") {
        return fetchRemoteFilteredList(searchTerm, listItemKeys);
      }
      return Promise.resolve([]);
    }, 500)
  ).current;

  /* @HINT: Setup function to handle `onChange` event of any <input> or <textarea> element used to enter text search query */
  const handleFilterTrigger = useCallback(
    (filterListAlgoRunner, event, listItemKeys = [""]) => {
      /* @HINT: Only react to `chnage` events from text inputs */
      if (
        event &&
        event.type === "change" &&
        event.target instanceof Element &&
        !event.defaultPrevented
      ) {
        /* @HINT: get the search query from the <input> or <textarea> element */
        const searchTerm = event.target.value;

        /* @HINT: Update the state depending on whether a 
          search term was entered into the text input element */
        if (searchTerm !== "") {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: true
          }));
        } else {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: false,
            list,
            page: 1
          }));
          return;
        }

        /* @HINT: Perform the text search using the search query on the list of items to search from */
        const filteredList = filterListAlgoRunner(
          searchTerm,
          list,
          listItemKeys
        );

        /* @HINT: If the text search algorithm function didn't return any results (on the client-side)... */
        if (filteredList.length === 0) {
          /* @HINT: ...then, use the debounced function to fetch a list of items from 
            the server-side that may match the search query */
          (
            delayedFetchRemoteFilteredList(searchTerm, listItemKeys) ||
            new Promise((resolve) => {
              resolve([]);
            })
          ).then((fetchedList) =>
            setController((prevController) => ({
              ...prevController,
              isLoading: false,
              page: 1,
              /* @ts-ignore */
              list: fetchedList.__fromCache
                ? filterListAlgoRunner(searchTerm, fetchedList, listItemKeys)
                : fetchedList
            }))
          );
          return;
        }

        /* @HINT: filtering on the client-side returned results so update state accordingly */
        setController({
          text: searchTerm,
          isLoading: false,
          list: filteredList,
          page: 1
        });
      }
    },
    [delayedFetchRemoteFilteredList, list]
  );

  useEffect(() => {
    if (list.length === 0) {
      if (controller.list.length !== list.length) {
        if (controller.text === "") {
          setController((prevController) => ({
            ...prevController,
            list
          }));
        }
      }
      return;
    }

    if (controller.text === "") {
      if (
        controller.list.length === 0 ||
        controller.list.length !== list.length
      ) {
        setController((prevController) => ({
          ...prevController,
          list
        }));
      } else {
        if (controller.page !== page) {
          setController((prevController) => ({
            ...prevController,
            page,
            list
          }));
        }
      }
    }
  }, [list, controller, page]);

  useEffect(() => {
    const throttledFilterUpdateCallback = throttleFilterCallbackRoutine(
      filterUpdateCallback,
      [controller, setController]
    );
    let shutdownCallback = () => undefined;

    if (controller.text !== text) {
      shutdownCallback = throttledFilterUpdateCallback();
    }

    return () => {
      shutdownCallback();
    };
  }, [text, controller, filterUpdateCallback]);

  /* @HINT: Finally, return controller and chnage event handler factory function */
  return [
    controller,
    handleFilterTrigger.bind(null, filterTextAlgorithmRunner)
  ];
}

export const TextFilterAlgorithmsProvider = ({
  children,
  extendAlgos = {}
}) => {
  const shared = useRef(
    Object.assign(extendAlgos, {
      specific(filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce(
            (finalStatusResult, filterListItemKey) => {
              const listItem =
                typeof filterListItem !== "object"
                  ? filterListItem
                  : extractPropertyValue(filterListItemKey, filterListItem);
              const haystack =
                typeof listItem === "string"
                  ? listItem.toLowerCase()
                  : String(listItem).toLowerCase();
              const needle = filterText.toLowerCase();

              return (
                filterText === "" ||
                haystack.indexOf(needle) > -1 ||
                finalStatusResult
              );
            },
            false
          );
        });
      },
      fuzzy(filterText = "", filterList = [], filterListItemKeys = [""]) {
        if (filterText === "") {
          return filterList;
        }

        const characters = filterText.split("");

        /* @NOTE: flatten the multi-dimesional list (array) */
        const chunks = Array.prototype.concat.apply(
          [],
          characters.map((character) => {
            return filterList.filter((filterListItem) => {
              return filterListItemKeys.reduce(
                (finalStatusResult, filterListItemKey) => {
                  const needle = character.toLowerCase();
                  const listItem =
                    typeof filterListItem !== "object"
                      ? filterListItem
                      : extractPropertyValue(filterListItemKey, filterListItem);
                  const haystack =
                    typeof listItem === "string"
                      ? listItem.toLowerCase()
                      : String(listItem).toLowerCase();
                  const radix = haystack.indexOf(needle);
                  let result = true;

                  if (radix === -1) {
                    result = false;
                  }
                  return result || finalStatusResult;
                },
                false
              );
            });
          })
        );

        return toUniqueItemList(
          filterListItemKeys.flatMap((filterListItemKey) =>
            toUniqueItemList(chunks, filterListItemKey)
          )
        );
      },
      complete(filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce(
            (finalStatusResult, filterListItemKey) => {
              const listItem =
                typeof filterListItem !== "object"
                  ? filterListItem
                  : extractPropertyValue(filterListItemKey, filterListItem);
              const haystack =
                typeof listItem === "string"
                  ? listItem.toLowerCase()
                  : String(listItem).toLowerCase();
              const needle = filterText.toLowerCase();

              let result = true,
                radix = -1,
                charPosition = 0,
                charValue = needle[charPosition] || null;

              while (null !== charValue) {
                radix = haystack.indexOf(charValue, radix + 1);
                if (radix === -1) {
                  result = false;
                  break;
                }
                charPosition += 1;
                charValue = needle[charPosition] || null;
              }
              return result || finalStatusResult;
            },
            false
          );
        });
      }
    })
  );

  return (
    <TextFilterAlgorithmsContext.Provider
      // eslint-disable-next-line react-hooks/exhaustive-deps
      value={useMemo(() => shared.current, [])}
    >
      {children}
    </TextFilterAlgorithmsContext.Provider>
  );
};
