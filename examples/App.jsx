import React, { useRef } from "react";
import { useBrowserStorage, useUICommands } from "../src/index";

export const App = () => {
  const listRef = useRef(null);
  const { getFromStorage } = useBrowserStorage({
    storageType: "local" /* @HINT: makes use of `window.localStorage` */
  });

  const commands = useUICommands({
    print: { /*  @HINT: Print command options */
      documentTitle: "My Printed List",
      onBeforePrint: () => console.log("before printing...."),
      onAfterPrint: () => console.log("after printing...."),
      removeAfterPrint: true,
      nowPrinting: () => console.log("currently printing...."),
    }
  });

  const list = getFromStorage("list", ["One", "Two", "Three", "Four"]);

  return (
    <>
    <ul ref={listRef}>
      {list.map((listItem, index) => {
        return <li key={`${listItem}_${index}`} onClick={() => {
          commands.hub.copy(
            listItem
          )
        }}>{listItem}</li>
      })}
    </ul>
    <button onClick={commands.hub.print(listRef)}>Print List</button>
    </>
  );
}
