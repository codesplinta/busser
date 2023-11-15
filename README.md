[![Generic badge](https://img.shields.io/badge/ReactJS-Yes-purple.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# busser
A robust, opinionated, state management option for scalable and precise communication across ReactJS Components rendered on the client-side.

## Motivation

The philosophy of [ReactJS](https://react.dev/reference/react) can be summarized using 2 phrases: *uni-directional data flow* and *top-to-bottom state reconciliation*. This philosophy is great for the most part (as it promotes things like the [locality of behavior](https://freek.dev/2423-locality-of-behavior)) until you need to have fine-grained state updates (not to be confused with fine-grained reactivity). [ReactJS](https://react.dev/reference/react) doesn't utilize reactivity at any level - This is because that goes against the "re-render everything with idempotence" mantra. [ReactJS](https://react.dev/reference/react) strongly suggests that side effects be hidden inside `useEffect()` and only deal with React-y stuff inside components and hooks but it's not always that simple. Firstly, `useEffect()` dependency list doesn't play nice with reference types (object, object literals and arrays). Secondly, `useMemo()` and `useCallback()` don't offer memoization in the true sense of the word - they only offer memoization between one render and the very next render following in turn. Finally, it's not every time you want a state change to trigger a re-render (especially of an entire sub-tree). Also, it's also not every time you need user interaction(s) on the UI to lead to a state change that eventually updates the UI. These cases are not catered for by [ReactJS](https://react.dev/reference/react) out-of-the-box!

Furthermore, there's an increase in the use of [React Context](https://legacy.reactjs.org/docs/context.html) in building our react apps because of it many benefits. However, [React context has it's own drawbacks too](https://blog.logrocket.com/pitfalls-of-overusing-react-context/) and also it's [painful performance issues at scale](https://github.com/bvaughn/rfcs/blob/useMutableSource/text/0000-use-mutable-source.md#context-api). Also, over-using [props](https://legacy.reactjs.org/docs/components-and-props.html#props-are-read-only) to pass data around and/or trigger state changes can slow [React](https://legacy.reactjs.org/) down significantly especially at scale. You might say: *"So ? that's exactly why React context was created - to help avoid prop drilling"* and you'd be partly right but (as stated earlier) using `useContext()` excessively can also lead to [wasteful re-renders](https://jotai.org/docs/basics/concepts). Sure, this *"wasteful re-renders"* issue can be solved with libraries like [**use-context-selector**](https://www.npmjs.com/package/use-context-selector) but again at a very high cost and has some limitations. The deeper a component using `useContext()` is in the component-tree hierarchy of a ReactJS app combined with more frequent UI state changes, the slower at rendering (and re-rendering) the app becomes even without **props**. All these issues are negligible with small ReactJS app with little client-side interactivity but become more pronounced over time in large ReactJS apps that have a much larger scale of client-side interactivity.

Busser seeks to reduce and/or eliminate these issues as much as is possible so you don't have to think too much about things that don't make you more productive at resolving bugs or building out features. Busser proposes a new way. This way involves reducing the number of props used by components to pass/transfer data by utilising events instead. This way/method is known as *"pruning the leaves"*. What this way/method of setting up data transfer amongst React components tries to achieve is to **"prune the leaves"** of the component tree and make fine-graned state updates easy and possible. The prolific teacher of ReactJS ([@kentcdodds](https://twitter.com/kentcdodds)), wrote something resembling this idea of "pruning leaves" the component tree here: [https://epicreact.dev/one-react-mistake-thats-slowing-you-down](https://epicreact.dev/one-react-mistake-thats-slowing-you-down/). This makes the entire component tree faster at re-rending by making the children of erstwhile parent components to be siblings. 

Therefore, this package (Busser) seeks to promote the idea that communication between React components should not be limited to **props/context** or through parent components alone. It utilizes the `Mediator Coding Pattern` (event bus model) to allow components communicate in a more constrained yet scalable way. This package was inspired partially by [**react-bus**](https://www.github.com/goto-bus-stop/react-bus), [**redux**](https://redux.js.org/introduction/examples#counter-vanilla) and [**jotai**](https://jotai.org/docs/core/atom). This package can also be used well with [**react-query**](https://github.com/tannerlinsley/react-query) to create logic that can work hand-in-hand to promote less boilerplate for repititive react logic (e.g. data fetching + management) and promote cleaner code.

#### Why is it necessary to adopt this novel way with Busser ?

>There are 2 major reasons why it's important to "prune the leaves" of React component tree for your app as seen below:

1. The virtual DOM is vital to how React works but also presents challenges of it's own in the manner in which it works. Some of these challenges include updating leave DOM nodes too often and not optimizing DOM updates where text node values are unchanged. The idea here is to try to workaround these challenges by trying to minimize the amount of wasteful re-renders the virtual DOM is bound to honour so that:

- 1. **The tree diff algorithm keeps on updating leaf (and parent) nodes that do not need to be updated**: The premise for this is that the time complexity of the tree diff algorithm used in ReactJS is linear time (O(n)) and doesn't just swap values (e.g. DOM attributes, DOM text nodes) in place (the way [signals](https://millermedeiros.github.io/js-signals/) do) from the virtual DOM to the real DOM. It actually replaces it in a [top-down replacement approach](https://programming.vip/docs/realization-and-analysis-of-virtual-dom-diff-algorithm.html#:~:text=The%20big,performance%20problem), the entire sub-tree and not just the node that changed. Therefore, you might end up with [bugs like this one](http://www.eventbrite.com/engineering/a-story-of-a-react-re-rendering-bug) sometimes.

- 2. **The CPU computation cost due to the tree diff algorithm used in updating/commiting into the DOM is heavy**: The premise here is that computing the difference between the real DOM and virtual is usually expensive when the scale of client interactivity is high.

2. The amount of wasteful re-renders are intensified without much effort in an almost exponentialy manner as the component tree grows deeper and larger.

- 1. **Memo ReactJS APIs aren't always reliable**: One could utilize the `useMemo()` and `useCallback()` (like the now decommisioned: `useEvent()` [hook](https://github.com/reactjs/rfcs/pull/220#issuecomment-1259938816)) functions to greatly reduce the number of wasteful re-renders. However, sometimes, tools like `useMemo()` and `useCallback()` don't always work well to reduce wasteful re-renders (especially when the dependency array passed to them contains values that change very frequently or contain reference types that are re-created on every render).
 
## The 2 categories of state

>There are 2 broad categories into which we can classify all of the state that any ReactJS app deals with

1. Transient or Temporary state (e.g. UI state, derived state)
2. Non-Transient or Permanent state (e.g. Server state, base state)

#### Rules of the novel way

It's important to note that busser can be used in one or all of 3 scenarios:

1. Sharing global base/derived state across multiple ReactJS components.
2. Sharing local base state across multiple ReactJS components.
3. Sharing local derived state across multiple ReactJS components.

There are a couple of rules that should be top of mind when using busser in any of these scenarios for maximum benefit. They are as follows:

1. Do not grow the component tree depth-wise, it's better to grow it breadth-wise instead (whenever you can) to cut down the use of **props** drastically.
2. Endeavour to pass mostly non-transient data via props to [presentation/leaf components](https://www.patterns.dev/posts/presentational-container-pattern) and never to [container components](https://www.section.io/engineering-education/container-components-in-react/). If it is ever a must to pass transient data via props, let it be at the top of the component-tree hierarchy of the ReactJS app.
3. All props should only be delivered from exactly one parent component to exactly one child component at any time.

## Old Concepts, New Setup

At the core, busser is simply a collection of ReactJS hooks. The concept of an [event bus](https://medium.com/elixirlabs/event-bus-implementation-s-d2854a9fafd5) (implemented using the `Mediator Coding Pattern` or `Pub/Sub`) employed to pass data around in parts of a frontend (and backend) software applications isn't new. This (pub/sub - think Redis) concept has been around for a long time in software developement and while being very vital to service-oriented/kernel software architecture and systems, it has been plagued in its use at scale when deployed on frontend web applications by lacking a set of correct and adequate logic constraints at scale as well as debug data about the events being fired in an orderly (and not a hapharzard) manner. It's very easy to overuse and by consequence get overwhelmed by the sheer number and frequency of events (from event buses) and data being fired and passed around respectively. However, the biggest issue with this concept at scale is managing the predicatability and flow of these events. So, this project proposed 1 specific way to communicate across components (as broadcasts - i.e. events fired from source to destination):

- cascade broadcasts

Therefore, the philosophy upon which **react-busser** operates and works is as follows:

1. An evented object (event bus) system built on ReactJS hooks.
2. Builds upon the existing state management features (`useState()`, `useRef()`, `useCallback()`, `useContext()`) already provided by ReactJS.
3. Emphazises and encourages prudent use of ReactJS props as well as the creation of child components only when necessary. The creation of sibling components is more prefered (remember as earlier said 👆🏾 - "prunning the leaves") to the creation of more child components.
4. Makes ReactJS component and business logic (in ReactJS hooks) more readable, reusable and maintainable by decoupling and relegating such logic to the ReactJS component that truly OWNS the logic (and not ancestor/parent components).

Let's look at an example of a custom ReactJS hook built with busser:

```typescript
import { useEffect } from 'react';
import { useBus } from 'busser';

export const usePageVerticallyScrolled = ({ threshold = 100 }) => {
  const [ bus ] = useBus(
    { subscribes: [], fires: ["document:vertical:scrolled"] },
    "App.document"
  ) as [ { emit: Function, on: Function, off: Function } ];

  useEffect(() => {
    const handleScroll = () => {
      let value = -1;

      if (window.pageYOffset <= threshold) {
        value = window.pageYOffset;
      } else {
        value = threshold;
      }

      bus.emit("document:vertical:scrolled", value);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [threshold]);
}

// usePageVerticallyScrolled({ threshold: 450 });
```

```typescript
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSharedState, useOutsideClicked } from 'busser';

const sequentialIdGeneratorFactory = (): (() => string) => {
  let i = 0;
  return () => `$__modal_${i++}`;
};

const hasNoChild = (children: React.ReactNode) => {
  const childCount = React.Children.count(children);
  return childCount === 0;
};

export function useModals <M extends HTMLElement>() {
  const [ Modal ] = useSharedState("modalComponent") as [ (children?: React.ReactNode) => JSX.Element ];
  const markModalsPosition = useRef<Record<string, number>>({});
  const [modals, setModals] = useState<React.ReactElement[]>([]);
  const controls = useMemo(
    () => {
       const idGeneratorRoutine: string = sequentialIdGeneratorFactory();
       return {
         show (node: React.ReactNode, reference?: React.MutableRefObject) {
           const id = idGeneratorRoutine();
           const modal = <Modal key={id} id={id} ref={reference}>{node}</Modal>;

           setModals((prevModals) => {
             markModalsPosition.current[id] = prevModals.length;
             return [...prevModals, modal];
           });
           // return id;
         },
         close (modalId: string) {

           let id = modalId;

           setModals((prevModals) => {
             if (id === null) {
               return prevModals;
             }

             const clonedPrevModals = prevModals.slice(0);
             const index = markModalsPosition.current[id];

             clonedPrevModals.splice(index, 1);
             return clonedPrevModals;
           });
         }
       }
    },
    []
  );

  useEffect(() => {
   () => {
     setModals([]);
   };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return [modals, controls];
}

export const useModalControls = (controls: { show: Function, close: (modalId: string) => void }, id: string) => {
  const [ ref ] = useOutsideClick((subject) => {
    controls.close(subject.id);
  });

  return {
    showModal (node: React.ReactNode) {
      if (hasNoChild(node)) {
        throw new Error("cannot show modal!");
      }
      
      return controls.show(React.cloneElement(node, { id }), ref);
    },
    closeModal () {
      if (ref.current) {
        controls.close(ref.current.id);
      }
    }
  };
};

// const [ modals, controls ] = useModals();

// const { showModal, closeModal } = useModalControls(controls, "Confirmation.Delete.Task");
// const { showModal, closeModal } = useModalControls(controls, "Confirmation.Change.Assignee");

```

### Cascade Broadcasts

>Cascade broadcasts sets up the stage for the evented object system which **react-busser** provides by turning each React component to an evented object (event bus). It ensures that the UI updates are predictable and that all events (from each event bus) fires in a well-timed fashion every single time. Also, there are well placed constraints to ensure that events are never fired out-of-order. The result is several interconnected perfect cycles of UI updates.

Some of these constraints promoted by the **Cascade Broadcasts** are as follows:

1. ReactJS props should only be used to deliver base or derived state data or state-altering callbacks from exactly one parent component to exactly one child and never to pass data across sibling components (via a parent component) or pass derived state data.
2. ReactJS context should never be mutated in place (lest it causes unwanted re-renders). It's best to use refs (`useRef()`) together with context (`useContext()`) and not context alone.
3. Events are always fired in a cascaded (successive) manner and never indiscriminately. `useEffect()` is usually used to implement this cascade of events.
4. There's no need to [lift state](https://legacy.reactjs.org/docs/lifting-state-up.html) at all!
5. Most of the logic used for [conditional rendering](https://legacy.reactjs.org/docs/conditional-rendering.html) is best situated inside a ReactJS hook which leaves the JSX much cleaner and readable.
6. Render props can now render mostly as pure, presentation JSX mostly.

Before you can setup cascade braodcasts, you have to be able to create a pair of custom ReactJS hooks where one of the pair makes use of `useBus()` to setup an event bus to trigger a broadcast. The broadcast can be a one-time thing or a stream. A single pair of ReactJS Hooks are responsible for either a one-time broadcast a single stream of braodcasts. This pair is made up of:

- A source hook
- A target hook

The **source hook** make use of `useBus()` to emit a one-time broadcast or streamed braodcast which is listened for by the **target hook**. The **react-busser** library exposes a collection of basic hooks that can be used to build other custom pair of hooks as follows:

## Data Primitives

>A Data primitive is the most basic data form that can be used to represent and structure data for use within a client-side rendered web application. Busser defines only 3 primitives that can be used in specific situations an they are packagedd as ReactJS hooks.

- `useCount()`: used for any kind of state that involves a counter
- `useList()`: used for any kind of state that involves a list
- `useComposite()`: used for any kind of state that involes updates made up of derived state from base state.

Let's look at some real-world use cases of how to actualize cascade broadcasts to manage state using paired ReactJS hooks:

Assuming we would like build an e-commerce site, we want to be able to manage **Cart** state. We need a centralised place (A React Component) to store this state but not in a global scope or using a global variable or global state. We need a local scope residing inside of a ReactJS hook. However, we want to be able to be notified of any changes to the **Cart** state anywhere else (Another React Component). How do we actualize this using **react-busser** ?

Well, we start by thinking about what a **Cart** state is and what it looks like. A **Cart** is a list of products that a user has selected with their respective quanities all tracked towards a purchase (checkout).

Without **react-busser**, one can choose to build a solution like [this one](https://github.com/notrab/react-use-cart/tree/main) but the problem with it is that:

1. It is reuses code logic where it's not needed.
2. It relies heavily on event listeners as function props which tightly couple a parent component to it's child component.
3. It requires it's own context provider (a lot of the time this can lead to a very nested mess of providers).

We can take another approach with the **react-busser** way. 

If we think about it well enough, the basic hook that suits our source hook is the `useList()` since a **Cart** is a list of products. Below, code to manage the **Cart** state is written as follows:

>SOURCE HOOK 👇🏾👇🏾
```javascript
import { useEffect, useCallback } from "react";
import { useBus, useList, useBrowserStorage, useSharedState } from "busser";

const EVENTS = {
  UNSET_CART: "unset:cart",
  ADD_TO_CART: "add:shopping:cart:item",
  REMOVE_FROM_CART: "remove:shopping:cart:item",
  EMPTY_CART: "empty:shopping:cart",
  INCREASE_CART_ITEM_QUANTITY_COUNT: "increment_quantity:shopping:cart:item",
  DECREASE_CART_ITEM_QUANTITY_COUNT: "decrement_quantity:shopping:cart:item",
  SET_CART_UPDATES: "set:shopping:cart:updates",
  RESET_CART_UPDATES: "reset:shopping:cart:updates",
  TRIGGER_EMPTY_CART: "shadow;empty:cart",
  TRIGGER_INCREASE_CART_ITEM_QUANTITY_COUNT: "shadow;increment:cart:item:quantity"
};


export const useCart = (
  initial,
  name,
  {
    maximumCartSize,
    itemPropForIdentity,
    itemPropForPrice,
    itemPropForQuantity
  },
  bus
) => {
  const { setToStorage } = useBrowserStorage({ storageType: "local" });
  const cartReducer = (prevList, { productItem, quantityValue }, event) => {
    let nextList = prevList.slice(0);
    const index = prevList.findIndex(
      (listItem) =>
        productItem && listItem[itemPropForIdentity] === productItem[itemPropForIdentity]
    );
    /* @HINT: Clone the product item so we can create a cart item out of it */
    const cartItem =
      ("structuredClone" in window)
        ? window.structuredClone(productItem)
        : JSON.parse(JSON.stringify(productItem));

    const quantity = cartItem[itemPropForQuantity];
    const price = cartItem[itemPropForPrice];
    const calculateUniqueItemsCount = prevList.length;

    switch (event) {
      case EVENTS.ADD_TO_CART:
        if (calculateUniqueItemsCount > maximumCartSize) {
          throw new Error("useCart[Error]: maximum cart size exceeded!");
        }

        if (!quantity || typeof quantity !== "number") {
          cartItem[itemPropForQuantity] = quantityValue || 1;
        }

        nextList = nextList.concat([cartItem]);
        break;
      case EVENTS.REMOVE_FROM_CART:
        nextList.splice(index, 1);
        break;
      case EVENTS.INCREASE_CART_ITEM_QUANTITY_COUNT:
        if (typeof cartItem[itemPropForQuantity] !== "number") {
          thorw new Error("useCart[Error]: cart item has no quanity to increment");
        }

        ++cartItem[itemPropForQuantity];
        nextList.splice(index, 1, cartItem);
        break;
      case EVENTS.DECREASE_CART_ITEM_QUANTITY_COUNT:
        if (typeof cartItem[itemPropForQuantity] !== "number") {
          thorw new Error("useCart[Error]: cart item has no quanity to decrement");
        }

        --cartItem[itemPropForQuantity];
        nextList.splice(index, 1, cartItem);
        break;
      case EVENTS.UNSET_CART:
        /* @HINT: reset the cart state back to its initial state */
        nextList = initial;
        break;
      default:
        /* @HINT: this default case deals with EVENTS.EMPTY_CART event*/
        nextList = [];
        break;
    }

    return nextList;
  };

  const [cartList, ...rest] = useList(
    [
      EVENTS.UNSET_CART,
      EVENTS.ADD_TO_CART,
      EVENTS.REMOVE_FROM_CART,
      EVENTS.INCREASE_CART_ITEM_QUANTITY_COUNT,
      EVENTS.DECREASE_CART_ITEM_QUANTITY_COUNT,
      EVENTS.EMPTY_CART
    ],
    cartReducer,
    initial,
    name
  );

  useEffect(() => {
    let eventName = EVENTS.SET_CART_UPDATES;

    if (cartList.length === 0) {
      eventName = EVENTS.RESET_CART_UPDATES;
    }

    const wasSaved = setToStorage(name, cartList.slice(0));

    if (wasSaved) {
      /* @HINT: Trigger single/stream braodcast in the cascade chain */
      bus.emit(eventName, cartList.slice(0));
    }
  }, [bus, cartList]);

  return [cartList, ...rest];
};





/* At this point, it's time to create a hook that houses our business logic for managing a shopping cart */

export const useCartManager = (initial = [], name) => {
  const [ cartConfig ] = useSharedState("cartConfig");

  /* @EXAMPLE:

  cartConfig = {
    maximumCartSize = 20,
    itemPropForIdentity = "id",
    itemPropForPrice = "price",
    itemPropForQuantity = "qty"
  }

  */

   /* @HINT: Setup event bus for triggering broadcasts for the `useCart()` hook */
  const [ bus ] = useBus(
    {
      fires: [EVENTS.SET_CART_UPDATES, EVENTS.RESET_CART_UPDATES],
      subscribes: [EVENTS.TRIGGER_EMPTY_CART, EVENTS.TRIGGER_INCREASE_CART_ITEM_QUANTITY_COUNT]
    },
    name
  );
  const [cartList, cartListUpdateFactory] = useCart(
    initial,
    name,
    cartConfig,
    bus
  );

  const argumentsTransformFactory = (quantityValue) => (product) => ({
    productItem: product,
    quantityValue
  });

  const addItemToCart = cartListUpdateFactory(
    EVENTS.ADD_TO_CART,
    argumentsTransformFactory(1)
  );
  const addItemToCartDoubleQuantity = cartListUpdateFactory(
    EVENTS.ADD_TO_CART,
    argumentsTransformFactory(2)
  );
  const removeItemFromCart = cartListUpdateFactory(
    EVENTS.REMOVE_FROM_CART,
    argumentsTransformFactory()
  );
  const emptyCart = cartListUpdateFactory(EVENTS.EMPTY_TODOS);
  const incrementCartItemQuantity = cartListUpdateFactory(
    EVENTS.INCREASE_CART_ITEM_QUANTITY_COUNT,
    argumentsTransformFactory()
  );
  const decrementCartItemQuantity = cartListUpdateFactory(
    EVENTS.DECREASE_CART_ITEM_QUANTITY_COUNT,
    argumentsTransformFactory()
  );


  const cartLength = cartList.length;

  const isAddedToCartAlready = useCallback((product) => (Boolean(cartList.find((listItem) => {
    return listItem[itemPropForIdentity] === product[itemPropForIdentity]
  }))), [itemPropForIdentity, cartLength]);

  const clickHandlerFactory = useCallback((product) => {
    return !isAddedToCartAlready(product)
      ? () => addItemToCart(product)
      : () => removeItemFromCart(product)
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {

    const emptyCartShadowHandler = () => emptyCart();
    const incrementCartQuantityShadowHandler = (product) => incrementCartItemQuantity(product);

    /* @NOTE: There are times where we want an action to be able to be triggered from multiple
        CTAs/button clicks/interactions on the UI instead of just one CTA/button click; In those 
        times we make use of #ShadowEvents: events that triggers another event on the cascade 
        of event(s) broadcasted */

    /* @HINT: Shadow events */

    bus.on(EVENTS.TRIGGER_EMPTY_CART, emptyCartShadowHandler);
    bus.on(EVENTS.TRIGGER_INCREASE_CART_ITEM_QUANTITY_COUNT, incrementCartQuantityShadowHandler);

    return () => {
      bus.off(emptyCartShadowHandler);
      bus.off(incrementCartQuantityShadowHandler);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return {
    emptyCart,
    addItemToCartDoubleQuantity,
    incrementCartItemQuantity,
    decrementCartItemQuantity,
    clickHandlerFactory,
    isAddedToCartAlready,
  };
}

```

The ReactJS hook above is the `useCart()` hook which is also the **source hook**. It will manage the **Cart** state directly. But we are not done. We still need the second ReactJS hook in the pair which will be used to recieve updates. Both ReactJS hooks can be defined once and used in one or many other ReactJS projects that make use of **react-busser**.

Again, below, code to manage the **Cart** state updates is written as follows:

>TARGET HOOK 👇🏾👇🏾
```javascript
import { useEffect } from "react";
import { useComposite } from "busser";

const EVENTS = {
  UNSET_CART: "unset:cart",
  ADD_TO_CART: "add:shopping:cart:item",
  REMOVE_FROM_CART: "remove:shopping:cart:item",
  EMPTY_CART: "empty:shopping:cart",
  INCREASE_CART_ITEM_QUANTITY_COUNT: "increment_quantity:shopping:cart:item",
  DECREASE_CART_ITEM_QUANTITY_COUNT: "decrement_quantity:shopping:cart:item",
  SET_CART_UPDATES: "set:shopping:cart:updates",
  RESET_CART_UPDATES: "reset:shopping:cart:updates",
  TRIGGER_EMPTY_CART: "shadow;empty:cart",
  TRIGGER_INCREASE_CART_ITEM_QUANTITY_COUNT: "shadow;increment:cart:item:quantity"
};

export const useCartUpdates = (
  initial = {
    augumentedCartList: [],
    totalAmountInCartList: 0,
    totalQuantityInCartList: 0,
    totalCountInCartList: 0
  },
  name,
  { itemPropForPrice, itemPropForQuantity }
) => {
  const compositeReducer = (prevComposite, cartList, event) => {
    let nextComposite = { ...prevComposite };

    const calculateItemTotals = cartList.map((listItem) => ({
      ...listItem,
      itemTotal: listItem[itemPropForPrice] * listItem[itemPropForQuantity]
    }));

    const calculatedTotal = cartList.reduce(
      (total, listItem) =>
        total + listItem[itemPropForQuantity] * listItem[itemPropForPrice],
      0
    );

    const calculatedTotalItems = cartList.reduce(
      (sum, listItem) => sum + listItem[itemPropForQuantity],
      0
    );

    const calculateUniqueItemsCount = cartList.length;

    switch (event) {
      case EVENTS.SET_CART_UPDATES:
        nextComposite = {
          ...nextComposite,
          augumentedCartList: calculateItemTotals,
          totalAmountInCartList: calculatedTotal,
          totalQuantityInCartList: calculatedTotalItems,
          totalCountInCartList: calculateUniqueItemsCount
        };
        break;
      default:
        /* @HINT: this default case deals with EVENTS.RESET_CART_UPDATES event*/
        nextComposite = initial;
        break;
    }

    return nextComposite;
  };

  return useComposite(
    [EVENTS.SET_CART_UPDATES, EVENTS.RESET_CART_UPDATES],
    compositeReducer,
    initial,
    name
  );
};
```

Now that we have a pair of source and target hooks, we can now start managing state.

```js
import React, { useCallback } from "react";
import { useCartManager } from "libs/hooks/cart";

import "./ProductList.css";

const EVENT_BUS_TAGS = {
  component: {
    PRODUCTLIST: "ProductList.component",
    PRODUCT: "Product.component",
    SHOPCHECKOUT: "ShopCheckout.component"
  }
};

const ProductList = ({
  /* @NOTE: all list of products */
  products = [],
  /* @NOTE: logged-in users' shopping cart from last session */
  cart = []
}) => {

  /* @HINT: One-liner to manage a shopping cart 😊 */
  const { clickHandlerFactory, isAddedToCartAlready } = useCartManager(
    cart,
    EVENT_BUS_TAGS.component.PRODUCTLIST
  );

  return (
    <>
      {products.length === 0 ? (
        <p className={"products_empty_msg"}>No products found!</p>
      ) : (
         <ul className={"product_list"}>
            {products.map((product, index) => {
               const ctaClickHandler = clickHandlerFactory(product);
               return (
                <li key={String(index)}>
                   <h4>{product.name}</h4>
                   <figure>
                     <img alt={product.image.description} src={product.image.source} />
                     <span>{product.price}</span>
                   </figure>
                    <div>
                      <button onClick={ctaClickHandler}>
                        {isAddedToCartAlready(product) ? "Remove From Cart" : "Add To Cart" }
                      </button>
                    </div>
                 </li>
              );
            }}
         </ul>
      )}
   </>
 );
}
```

### Shadow Events

>Shadow events work along with the concept of cascade broadcasts. They make it possible to 

They are events that are setup to handle events triggered from a React component other than the component that houses the **source hook*. They are used to centralize the logic for specific events that enable a cascade broadcast to loop back to it's last bbroadcast origin.


### Ideas borrowed from Redux

There are a couple of ideas that busser borrows from Redux. These ideas are crucial to the manner busser works in general.

- Reducers
- Synchronous Actions (ONLY)
- An Evented Store

### Ideas borrowed from Jotai

There are also a couple of ideas that busser orrows from Jotai.

- Atom

## Example(s)

>Here is an example (screenshot) of a simple _**todo app**_ built using **react-busser**. It uses 2 custom ReactJS hooks (`useTodoList()` and `useTodoCounter()`) that do the job of managing the _**todo list**_ state data and _**todo count**_ state data respectively.

<img width="681" alt="Screenshot 2022-05-12 at 12 16 35 AM" src="https://user-images.githubusercontent.com/5495952/170497986-c08198a0-08f7-4b42-a095-749ae5fc175d.png">

>Also, below is a simple diagram that depicts how the _**todo app**_ built with **react-busser** works

<img width="678" alt="Screenshot 2022-05-25 at 10 49 00 PM" src="https://user-images.githubusercontent.com/5495952/170499219-193e44fa-5ab1-4404-8b97-324940c7568c.png">

As you can see above, There are 3 ReactJS components and each of them communicate without ReactJS props (because props aren't needed to pass data to sibling components). Also each ReactJS component either listens for or fires events sometimes doing both. You can find the live working example code and logic on [codesandbox](https://codesandbox.io/s/react-busser-simple-demo-370ze6). You can play around with it!

>Now for contrast, let us take a look at a simple _**todo app**_ built without using **react-busser**. It uses the regular ReactJS hooks `useState()` to manage state but see how messy the code (screenshot) is below

<img width="783" alt="Screenshot 2022-05-26 at 2 53 46 PM" src="https://user-images.githubusercontent.com/5495952/170502555-21a60282-00eb-46a7-b93a-f935867d794f.png">

As you can see above, There are also 3 components that communicate using ReactJS props. However, the logic for managing the state for `todoList` using `const [todoList, setTodoList] = useState([])` is located outside the `<TodoList items={todoList} />` component and not inside it because we had to [lift state](https://legacy.reactjs.org/docs/lifting-state-up.html) so that it's possible to share changing data (derived from `todoList`) using `getCount()` for the `<TodoCounter count={getCount(todoList)} />` component. This makes the ReactJS logic/code less readable and harder to manage in the long-term.

Also, the `<TodoForm/>` component is uncessarily re-rendered anytime the `<TodoList items={todoList} />` triggers a re-render of itself by updating the `todoList` state. You can find the live working example code and logic on [codesandbox](https://codesandbox.io/s/no-react-busser-alternate-simple-demo-xnknxq).

## Installation
>Install using `npm`

```bash
   npm install busser
```

>Or install using `yarn`

```bash
   yarn add busser
```

## Getting Started
>To get started using the `busser` package, you need to import the `useBus()` hook (optionally) into your component to emit and listen to events. Then, import the `usePromised()` to listen for events and then emit only those events being listened to by `usePromised()`. 

```jsx
import React, { useState } from 'react'
import { useUIDataFetcher, useFetchBinder, usePromised, useUpon } from 'busser'

function LoginForm ({ title }) {

   const eventName = "request:start";

   const EVENT_BUS_TAGS = {
    component: {
      LOGINFORM: "LoginForm.component"
    }
  };

   const [ state, setState ] = useState({
     isSubmitting: false,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   });

   const { connectToFetcher } = useUIDataFetcher({
      url: 'http://localhost:6700/api/login',
      customizePayload: (response) => {
         return (response.body || response).data
      }
   });
   const { fetchData, fetchError, boundFetcher } = useFetchBinder(connectToFetcher);

   const [ makeFormSubmitTrigger ] = usePromised(eventName, ({ payload }) => {
    return boundFetcher({
      method: 'POST',
      data: payload,
      metadata: { verb: 'post' }
    })
   }, EVENT_BUS_TAGS.component.LOGINFORM)

   const onInputChange = useUpon((event) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [e.target.name]: event.target.value 
        }
      })
   });

   const submitFormWithPayload = makeFormSubmitTrigger(eventName, (state) => {
     return {
       payload: state.formSubmitPayload
     }
   })

   const handleFormSubmit = (e) => {
      e.preventDefault();
      submitFormWithPayload(state).then(() => {
        alert("All done!");
      })
   };

   return (
      <div>
         <h3>{title}</h3>
         <p>{state.isSubmitting ? 'Logging In…' : 'Login' }</p>
         <form onSubmit={handleFormSubmit}>
            <input name={"email"} type={"email"} value={state.formSubmitPayload.email} onChange={onInputChange} autoFocus />
            <input name={"password"} type={"password"} value={state.formSubmitPayload.password} onChange={onInputChange} />
            <button type={"submit"} disabled={state.isSubmitting}>Login</button>
         </form>
     </div>
  )
} 

export default LoginForm
```

```jsx
import React, { useState, useEffect } from 'react'
import { useComposite } from 'busser'

function ToastPopup({ position, timeout }) {

   const EVENT_BUS_TAGS = {
     component: {
       TOASTPOPUP: "ToastPopup.component"
     }
   };

   const [ toastPopup, makeToastPopupCloseTrigger ] = useComposite(
      ['request:ended', 'toast:delete'],
      (prevComposite, { error, metatdata }, eventName) => {
         const listCopy = prevComposite.list.slice(0);
         let showCopy = prevComposite.show;

         switch (eventName) {
            case "request:ended":
               const struct = {
                  iconLink: null,
                  color: '',
                  message: '',
                  title: ''
               }

               struct.title = metadata.requestType
               struct.message = error !== null ? 'Request Failed' : 'Request Succeded'
               struct.color = error !== null ? 'red' :  'green'

               listCopy.unshift(struct);
               showCopy = true;
            break;
            case "toast:delete":
               delete listCopy[0];
               showCopy = false
            break;
         }

         return { list: listCopy, show: showCopy };
      },
      { list:[], show: false },
      EVENT_BUS_TAGS.component.TOASTPOPUP
   );


   const handleToastClose = makeToastPopupCloseTrigger('toast:delete', (event) => {
     if (event !== null) {
       event.stopPropagation();
     }

     return {
       error: null,
       metadata: {}
     };
   });

   useEffect(() => {
     const timerID = setTimeout(() => {
       handleToastClose(null)
     }, parseInt(timeout))

     return () => clearTimeout(timerId)

   /* eslint-disable-next-line react-hooks/exhaustive-deps */
   }, []);

   return (
      {!toastPopup.show 
        ? null 
        : <section className={`notification-container ${position}`}
           toastPopup.list.map(({ iconLink, title, message, color }) => (<div className={`notification toast ${color}`}>
             <button onClick={handleToastClose}>
               <strong>x</strong>
             </button>
             <div className="notification-icon-image">
               <img src={iconLink} alt="notification-icon" />
             </div>
             <div>
               <p className="notification-title">{title}</p>
               <p className="notification-message">{message}</p>
             </div>
           </div>
           )
         </section>   
   })
}

export default ToastPopup
```

>Setup the `App.jsx` file that holds the entry point to the React app

```jsx
import logo from './logo.svg'

import LoginForm from './src/LoginForm'
import ToastPopup from './src/ToastPopup'

import { useHistory } from 'react-router'
import { useRoutingChanged } from 'busser'

import "./App.css"

function App () {

  const history = useHistory();
  useRoutingChanged('app:routed', history, 'App.component');

  return (
     <div className="App">
        <header className="App-Header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Rapper-Conf</h1>
        </header>
        <p className="App-intro">
          <span className="App-Lead-Text">Don’t have an account yet ? </span>
 	       <a href="/auth/register" className="App-Basic-Link">register</a>
        </p>
         <section className="App-Body">
            <LoginForm title="Hey There!" />
         </section>
         <footer className="App-Footer">
           <ToastPopup position="bottom-right" timeout={2500} />
         </footer>
      </div>
  );
}

export default App;
```
>Then, in the `index.js` file of your project, do this:

```jsx
import * as React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { EventBusProvider, HttpClientProvider } from 'busser'
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './App'

function Root() {

  return (
    <HttpClientProvider httpClient={axios}>
      <EventBusProvider>
         <App />
      </EventBusProvider>
    </HttpClientProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
```

### Using React-Query with busser

```jsx

import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useUIDataFetcher, usePromised, useBrowserStorage, useUpon } from 'busser'

function LoginForm ({ title }) {

   const eventName = 'request:start';

   const EVENT_BUS_TAGS = {
     component: {
       LOGINFORM: "LoginForm.component"
     }
   };

   const { setToStorage, clearFromStorage } = useBrowserStorage({
     storageType: "session"
   });

   const [ state, setState ] = useState({
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   });

   const { fetcher } = useUIDataFetcher({
     url: 'http://localhost:6700/api/login'
   });

   const queryClient = useQueryClient();

   const { mutate, error, data, isLoading, isError } = useMutation(
     ({ data, metadata }) => fetcher({ method: 'POST', payload: data, metadata }),
     {
       onSuccess: (data, variables) => {
         queryClient.invalidateQueries('auth')
         queryClient.setQueryData(['auth', { id: variables.id }], data)
       }
     }
   );

   const [ makeFormSubmitTrigger ] = usePromised(eventName, ({ form }) => {
      return new Promise ((resolve, reject) {
         mutate({
            data: Object.fromEntries(new FormData(form)),
            metadata: { }
         }, {
          onSuccess: resolve,
          onError: reject
         });
      })
  }, EVENT_BUS_TAGS.component.LOGINFORM);

   useEffect(() => {
      setToStorage('user', JSON.stringify(data));

      return () => clearFromStorage('user')
   }, [data])

   const onInputChange = useUpon((event) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [event.target.name]: event.target.value 
        }
      })
   });

   const handleFormSubmit = makeFormSubmitTrigger(eventName, (event) => {
      if (event && event.type === "change") {
        e.preventDefault();
        return {
          form: e.target
        }
     }
   });

   return (
     <div>
        <h3>{title}</h3>
        <p>{isLoading ? 'Logging In…' : 'Login' }</p>
        <form onSubmit={handleFormSubmit} name={"login"} method={"post"}>
           <input name={"email"} type={"email"} value={state.formSubmitPayload.email}  onChange={onInputChange} />
           <input name={"password"} type={"password"} value={state.formSubmitPayload.password} onChange={onInputChange} />
           <button type={"submit"} disabled={!state.isSubmitButtonEnabled}>Login</button>
        </form>
        {isError && <span className={"error"}>{error.message}</span>}
    </div>
  );
}

export default LoginForm
```

```js
import logo from './logo.svg'

import LoginForm from './src/LoginForm'

import { useHistory } from 'react-router'
import { useRoutingChanged } from 'busser'

import "./App.css"

function App () {

  const history = useHistory();
  useRoutingChanged('app:routed', history, 'App.component')

  return (
     <div className="App">
        <header className="App-Header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Rapper-Conf</h1>
        </header>
        <p className="App-intro">
          <span className="App-Lead-Text">Don’t have an account yet ? </span>
 	       <a href="/auth/register" className="App-Basic-Link">register</a>
        </p>
         <section className="App-Body">
            <LoginForm title="Hey There!" />
         </section>
         <footer className="App-Footer">
           <ToastPopup position="bottom-right" timeout={2500} />
         </footer>
      </div>
  );
}

export default App
```

```js
import * as React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from 'react-query';
import { EventBusProvider, HttpClientProvider } from 'busser'
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './App'

function Root() {

  const queryClient = new QueryClient();

  return (
    <HttpClientProvider httpClient={axios}>
      <EventBusProvider>
        <QueryClientProvider client={queryClient}>
           <App />
        </QueryClientProvider>
      </EventBusProvider>
    </HttpClientProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
```

## License

MIT License

## Documentation
>busser is made up of ReactJS hooks as follows:

- `useBus()`: used to setup communication from one component to another using the events routed via the central event bus (pub/sub).
- `useOn()`: used to setup event handlers on the central event bus. 
- `useUpon()`: used to wrap a callback with `useCallback` automatically.
- `useList()`: used to manage a list (array) of things (objects, strings, numbers e.t.c).
- `useCount()`: used to manage counting the occurence of an event or addition of enitities (items in a list (data structure)).
- `useRoutingChanged()`: used to respond to a SPA page route changes via events.
- `useRoutingBlocked()`: used to respond to `beforeunload` event in the browser via events.
- `useComposite()`: used to process derived state that is made from logical chnages made on base state via events.
- `usePromised()`: used to execute any async task with a deffered or promised value triggered via events.
- `useRoutingMonitor()`: used to monitor page route changes from a central place inside a app router component.
- `useBrowserStorage()`: used to access and update data in either `window.localStorage` or `window.sessionStorage`.
- `useBrowserStorageWithEncryption()`: used to access and update data in either `window.localStorage` or `window.sessionStorage` while using encryption.
- `useSharedState()`: used to share global state to any set of components deep in the tree hierarchy without re-rendering the whole sub-tree.
- `useUnsavedChangesLock()`: used to generate a custom `getUserConfirmation()` function for your router of choice: `<BrowserRouter/>` or `<HashRoute/>`.
- `useSearchParamsState()`: used to ensure that `useSearchParams()` doesn't lose any URL location search state between route changes.
- `useComponentMounted()`: used to determine if a React component is mounted or not.
- `useOutsideClick()`: used to respond to clicks outside a target DOM element.
- `usePageFocused()`: used to determine when the document (web page) recieves focus from user interaction.
- `useIsFirstRender()`: used to determine when a React component is only first rendered.
- `useBeforePageUnload()`: used to respond to `beforeunload` event in the browser with a message only when a condition is met.
- `useControlKeysPress()`: used to respond to `keypress` event in the browser specifically for control keys (e.g. Enter, Tab).
- `useHttpSignals()`: used to setup events for when async http requests are started or ended.
- `useIsDOMElementIntersecting()`: used to determine if an intersection observer has targeted a DOM element at the intersection threshold.
- `useTextFilteredList()`: used to filter a list (array) of things based on a search text being typed into an input.

### API details


- `useBus(
    config: {
      subscribes?: Array<string>
      , fires?: Array<string>
    }
    , name?: string
  )
`
- `useOn(
    eventNameOrEventNameList: string | Array<string>
    , listener: Function
    , name?: string
  )
`
- `useUpon(
    callback: Function
  )
`
- `useList(
     eventNameOrEventNameList: string | Array<string>
     , listReducer: Function
     , list: Array<any>
     , name?: string
   )
`
- `useCount(
     eventNamesOrEVentNameList: string | Array<string>
     , countReducer: Function
     , options: { start: number, min: number, max: number }
     , name?: string
   )
`
- `useRoutingChanged(
     eventName: string
     , history: Pick<RouteChildrenProps, "history">
     , name?: string
   )
`
- `useRoutingBlocked(
     eventName: string
     , history: Pick<RouteChildrenProps, "history">
     , name?: string
   )
`
- `useComposite(
     eventNameOrEventNameList: string | Array<string>
     , compositeReducer: Function
     , composite: Record<string, any>
     , name?: string
   )
`
- `usePromised(
     eventNameOrEventNameList: string | Array<string>
     , handler: Function
     , name?: string
   )
`
- `useRoutingMonitor(
     config: {
       setupPageTitle?: boolean
       , onNavigation?: Function
       , getUserConfirmation: Function
       , unsavedChangesRouteKeysMap?: Record<string, string>
       , documentTitlePrefix?: string
       , appPathnamePrefix?: string
       , promptMessage?: string
       , shouldBlockRoutingTo?: () => boolean,
     }
   )
`
- `useBrowserStorage(
     config: {
       storageType: "local" | "session"
     }
   )
`
- `useBrowserStorageWithEncryption(
     config: {
       storageType: "local" | "session"
     }
   )
`
- `useSharedState(
     stateSlice?: string
   )
`
- `useUnsavedChangesLock(
    config: {
      useBrowserPrompt?: boolean
    }
  )
`
- `useSearchParamsState(
    searchParamName: string,
    , defaultvalue?: string
  )
`
- `useComponentMounted(
  )
`
- `useOutsideClick(
    callback
  )
`
- `usePageFocused(
  )
`
- `useIsFirstRender(
  )
`
- `useBeforePageUnload(
    callback: Function
    , options: { when: boolean, message: string }
  )
`
- `useControlKeysPress(
    callback: Function
    , keys: string[]
  )
`
- `useHttpSignals(
  )
`
- `useIsDOMElementIntersecting(
    domElement: Element | HTMLElement,
    options: IntersectionObserverInit
  )
`
- `useTextFilteredList(
     config: {
       list: Array<any>
       , page?: number
       , text?: string
     },
     options: {
       filterTaskName?: string
       , fetchRemoteFilteredList?: () => Promise<Array<any>>
       , filterUpdateCallback?: () => () => void
     }
   )
`

## Articles

- You can read about how **react-busser** compares to other state management options [here](https://isocroft.medium.com/introducing-react-busser-designing-for-better-application-data-flow-in-reactjs-part-1-5eb4e103eff9): 
- You can also read about how **react-busser** can be used with async operations [here](https://isocroft.medium.com/introducing-react-busser-designing-for-better-application-data-flow-in-reactjs-part-2-xxxxxxxxxxxx)

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```
