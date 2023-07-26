import React from "react";
import { render } from "@testing-library/react";

function assertReadonlyGlobalsNotMutable (property) {
  const readOnlyGlobalObjects = [
    "origin",
    "history",
    "clientInformation",
    "caches",
    "closed",
    "crypto",
  ];

  if (readOnlyGlobalObjects.includes(property)) {
    throw new Error(`Cannot override sensitive readonly global object: "${property}"`);
  }
}

/**
 * A custom render to setup providers with a real consumer component.
 * Extends regular render options with `providerProps` to allow 
 * injecting different scenarios to test with.
 * 
 * This is used when testing a actual consumer component making use 
 * of the provider
 * 
 * @param Provider  
 * @returns Function {() => RenderResult<T>}
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
export function getCustomRendererFor(Provider) {
  return (
    wrappedComponent,
    { providerProps },
    renderOptions) => {
    return render(
      <Provider value={providerProps}>{wrappedComponent}</Provider>,
      renderOptions
    );
  };
};

/**
 * A custom render to setup provider with a test context consumer component.
 * Extends regular render options with a custom props to allow inpecting 
 * state changes.
 * 
 * This is used to render a provider while testing it directly.
 * 
 * @param Provider 
 * @param props
 * @param renderOptions 
 * @returns Object {RenderResult<T>}
 */
export const renderProvider = (
    Provider,
    props,
    renderOptions
) => {
 return render(
   <Provider>{props.children}</Provider>,
   renderOptions
 )
}

/**
 * A helper utility for replacing native object and BOM APIs in web browsers
 * with a fake implementation replica so as to make testing a lot easier.
 * 
 * @param property 
 * @param value 
 */
export const provisionFakeWebPageWindowObject = (property, value) => {
    const { [property]: originalProperty } = window;
  
    beforeAll(() => {
      assertReadonlyGlobalsNotMutable(property);
      delete window[property];
  
      Object.defineProperty(window, property, {
        configurable: true,
        writable: true,
        value,
      });
    });
  
    afterAll(() => {
      if (Boolean(originalProperty)) {
        window[property] = originalProperty;
      }
    });
  };
