[![Generic badge](https://img.shields.io/badge/ReactJS-Yes-purple.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# busser
An evented object system for scalable and performant communication across ReactJS Components. 

## Motivation

There's an increase in the use of [React Context](https://reactjs.org/docs/context.html) in building our react apps because of it many benefits. However, [React context has it's own drawbacks too](https://blog.logrocket.com/pitfalls-of-overusing-react-context/) and also it's [painful performance issues at scale](https://github.com/bvaughn/rfcs/blob/useMutableSource/text/0000-use-mutable-source.md#context-api). Also, over-using [props](https://reactjs.org/docs/components-and-props.html#props-are-read-only) to pass data around and/or trigger state changes can slow [React](https://reactjs.org/) down significantly especially at scale. You might say: "So ? that's exactly why React context came into being - to help avoid prop drilling" and you'd be partly right but (as stated earlier) can also lead to [wasteful re-renders](https://jotai.org/docs/basics/concepts). This wasteful re-renders can be solved with libraries like [**use-context-selector**](https://www.npmjs.com/package/use-context-selector) but at a very high cost and has some limitations. The deeper the component tree of a React app is with more frequent UI state changes, the slower at rendering (and re-rendering) the app becomes when using mostly **props/context**. What this method of setting up data passing amongst React components tries to achieve is to **"prune the leaves"** of the component tree. This makes the entire component tree faster at re-rending by making the children of erstwhile parent components siblings. What this package seeks to promote therefore is to not limit the communication between React components to props/context and through parent components alone. It is to utilize the `Mediator Coding Pattern` (event bus) to allow components communicate in a more constrained yet scalable way. This package was inspired partially by [**react-bus**](https://www.github.com/goto-bus-stop/react-bus). This package can also be used well with [**react-query**](https://github.com/tannerlinsley/react-query) to create logic that can work hand-in-hand to promote less boilerplate for repititive react logic (e.g. data fetching + management) and promote cleaner code.

>There are 2 major reasons why it's important to "prune the leaves" of React component tree for your app as seen below:

1. The virtual DOM is vital to how React works but also presents challenges of it's own in the manner in which it works. The idea here is to try to workaround these challenges by trying to minimize the amount of wasteful re-renders so that .

- 1. **The tree diff algorithm keeps on updating leaf (and parent) nodes that do not need to be updated**: The premise for this is that the time complexity of the tree diff algorithm used in ReactJS is linear time (O(n)) and doesn't just swap values (DOM attributes, DOM text nodes) in place from the virtual DOM to the real DOM. It actually replaces it in a [top-down replacement approach](https://programming.vip/docs/realization-and-analysis-of-virtual-dom-diff-algorithm.html#:~:text=The%20big,performance%20problem), the entire sub-tree and not just the node that changed. Therefore, you might end up with [bugs like this one](http://www.eventbrite.com/engineering/a-story-of-a-react-re-rendering-bug).

- 2. **The CPU computation due to the tree diff algorithm used in updating components is heavy**: The premise here is that computing the difference between the real DOM and virtual is usually expensive at scale only.

2. The amount of wasteful re-renders are intensified without much effort in an almost exponentialy manner as the component tree grows deeper.

- 1. You have to utilize `useMemo()` and `useCallback()` (and maybe the upcoming `useEvent()`) functions to greatly reduce the number of wasteful re-renders. However, sometimes, tools like `useMemo()` and `useCallback()` don't always work well to reduce wasteful re-renders (especially when the dependency array passed to them contains values that change very frequently).

So, instead of growing the component tree depth-wise, it's better to grow it breadth-wise whenever you can to cut down the use of props drastically. Also, only pass transient data via props to presentation/leaf components and never to container components. Finally, props should only be delivered from exactly one parent component to exactly one child component at any time.

## Old Concepts, New Setup

This concept of an [event bus](https://medium.com/elixirlabs/event-bus-implementation-s-d2854a9fafd5) (implemented using the `Mediator Coding Pattern`) employed to pass data around in parts of a frontend (and backend) software applications isn't new. This (pub/sub - think Redis) concept has been around for a long time in software developement and while being very vital to service-oriented/kernel software architecture and systems, it has been plagued in its use at scale when deployed on frontend web applications by lacking a set of correct and adequate logic constraints at scale as well as debug data about the events being fired in an orderly (and not a hapharzard) manner. It's very easy to overuse and by consequence get overwhelmed by the sheer number and frequency of events (from event buses) and data being fired and passed around respectively. However, the biggest issue with this concept at scale is managing the predicatability and flow of these events. So, this project proposed 1 specific way to communicate across components (as broadcasts - i.e. events fired from source to destination):

- cascade broadcasts

Therefore, the philosophy upon which **react-busser** operates and works is as follows:

1. An evented object system built on ReactJS hooks.
2. Builds upon the existing state management features (`useState()`, `useRef()`, `useReducer()`, `useContext()`) already provided by ReactJS.
3. Emphazises and encourages prudent use of ReactJS props as well as the creation of child components only when necessary. The creation of sibling components is more prefered (remember as earlier said ???????? - "prunning the leaves") to the creation of more child components.
4. Makes ReactJS component and business logic (in ReactJS hooks) more readable, reusable and maintainable by decoupling and relegating such logic to the ReactJS component that truly OWNS the logic (and not it's ancestor - parent component).

### Cascade Broadcasts

>Cascade braodcasts sets up the stage for the evented object system which **react-busser** provides by turning each React component to an evented object. It ensures that the UI updates are predictable and that all events (from each event bus) fires in a well-timed fashion every single time. Also, there are well placed constraints to ensure that events are never fired out-of-order. The result is a perfect cycle of UI updates.

Some of these constraints promoted by the **Cascade Broadcasts** are as follows:

1. ReactJS props should only be used to deliver base or derived state data or state-altering callbacks from exactly one parent component to exactly one child and never to pass data across sibling components (via a parent component) or pass derived state data.
2. ReactJS context should never be mutated in place (lest it causes unwanted re-renders). It's best to use refs (`useRef()`) together with context (`useContext()`) and not context alone.
3. Events are always fired in a cascaded (successive) manner and never indiscriminately. `useEffect()` is usually used to implement this cascade of events.
4. There's no need to [lift state](https://reactjs.org/docs/lifting-state-up.html) at all!
5. Most [Conditional rendering](https://reactjs.org/docs/conditional-rendering.html) logic is best situated inside a ReactJS hook which leaves the JSX much cleaner.
6. Render props can now render mostly as pure, presentation/leaf components.

## Example(s)

>Here is an example (screenshot) of a simple _**todo app**_ built using **react-busser**. It uses 2 custom ReactJS hooks (`useTodoList()` and `useTodoCounter()`) that do the job of managing the _**todo list**_ state data and _**todo count**_ state data respectively.

<img width="681" alt="Screenshot 2022-05-12 at 12 16 35 AM" src="https://user-images.githubusercontent.com/5495952/170497986-c08198a0-08f7-4b42-a095-749ae5fc175d.png">

>Also, below is a simple diagram that depicts how the _**todo app**_ built with **react-busser** works

<img width="678" alt="Screenshot 2022-05-25 at 10 49 00 PM" src="https://user-images.githubusercontent.com/5495952/170499219-193e44fa-5ab1-4404-8b97-324940c7568c.png">

As you can see above, There are 3 ReactJS components and each of them communicate without ReactJS props (because props aren't needed to pass data to sibling components). Also each ReactJS component either listens for or fires events sometimes doing both. You can find the live working example code and logic on [codesandbox](https://codesandbox.io/s/react-busser-simple-demo-370ze6). You can play around with it!

>Now for contrast, let us take a look at a simple _**todo app**_ built without using **react-busser**. It uses the regular ReactJS hooks `useState()` to manage state but see how messy the code (screenshot) is below

<img width="783" alt="Screenshot 2022-05-26 at 2 53 46 PM" src="https://user-images.githubusercontent.com/5495952/170502555-21a60282-00eb-46a7-b93a-f935867d794f.png">

As you can see above, There are also 3 components that communicate using ReactJS props. However, the logic for managing the state for `todoList` using `const [todoList, setTodoList] = useState([])` is located outside the `<TodoList items={todoList} />` component and not inside it because we had to [lift state](https://reactjs.org/docs/lifting-state-up.html) so that it's possible to share changing data (derived from `todoList`) using `getCount()` for the `<TodoCounter count={getCount(todoList)} />` component. This makes the ReactJS logic/code less readable and harder to manage in the long-term.

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
   const initialState = {
     isSubmitting: false,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }

   const [ state, setState ] = useState(initialState);
   const { connectToFetcher } = useUIDataFetcher({
      url: 'http://localhost:6700/api/login',
      customizePayload: (response) => {
         return (response.body || response).data
      }
   });
   const { fetchData, fetchError, boundFetcher } = useFetchBinder(connectToFetcher)
   const eventName = "request:start"
   const [ makeFormSubmitTrigger ] = usePromised(eventName, ({ payload }) => {
    return boundFetcher({
      method: 'POST',
      data: payload,
      metadata: { verb: 'post' }
    })
   }, 'LoginForm.component')

   const onInputChange = useUpon((e) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [e.target.name]: e.target.value 
        }
      })
   })

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
         <p>{state.isSubmitting ? 'Logging In???' : 'Login' }</p>
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
      'ToastPopup.component'
   );


   const handleToastClose = makeToastPopupCloseTrigger('toast:delete', (e) => {
     if (e !== null) {
      e.stopPropagation();
     }

     return {
      error: null,
      metadata: {}
     }
   });

   useEffect(() => {
     const timerID = setTimeout(() => {
       handleToastClose(null)
     }, parseInt(timeout))

     return () => clearTimeout(timerId)
   }, [handleToastClose])

   return (
      {!toastPopup.show 
        ? null 
        : <div className={`notification-container ${position}`}
           toastPopup.list.map(({ iconLink, title, message, color }) => <div className={`notification toast ${color}`}>
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
         </div>   
   })
}

export default ToastPopup
```

>Setup the `App.jsx` file that holds the entry point to the React app

```jsx
import logo from './logo.svg'

import LoginForm from './src/LoginForm'
import ToastPopup from './src/ToastPopup'

import { withRouter } from 'react-router-dom'
import { useRouted } from 'busser'

import "./App.css"

function App ({ history }) {

  useRouted('app:routed', history, 'App.component')

  return (
     <div className="App">
        <header className="App-Header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to RapConf</h1>
        </header>
        <p className="App-intro">
          <span className="App-Lead-Text">Don???t have an account yet ? </span>
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

export default withRouter(App)
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

ReactDOM.render(<Root />, document.getElementById('root'))
registerServiceWorker()
```

### Using React-Query with busser

```jsx

import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useUIDataFetcher, usePromised, useUpon } from 'busser'

function LoginForm ({ title }) {
   const initialState = {
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }
   
   const [ state, setState ] = useState(initialState);
   const { fetcher } = useUIDataFetcher({
     url: 'http://localhost:6700/api/login'
   })
   const queryClient = useQueryClient()
   const { mutate, error, data, isLoading, isError } = useMutation(
     ({ data, metadata }) => fetcher({ method: 'POST', payload: data, metadata }),
     {
       onSuccess: (data, variables) => {
         queryClient.invalidateQueries('auth')
         queryClient.setQueryData(['auth', { id: variables.id }], data)
       }
     }
   )

   const eventName = 'request:start'
   const [ makeFormSubmitTrigger ] = usePromised(eventName, ({ form }) => {
     return mutate({
        data: new FormData(form),
        metadata: { }
     })
  }, 'LoginForm.component');

   React.useEffect(() => {
      if (data !== null) {
         window.localStorage.setItem('user', JSON.stringify(data));
      }

      return () => window.localStorage.clearItem('user')
   }, [data])

   const onInputChange = useUpon((e) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [e.target.name]: e.target.value 
        }
      })
   })

   const handleFormSubmit = makeFormSubmitTrigger(eventName, (e) => {
      if (e && e.type === "change") {
        e.preventDefault();
        return {
          form: e.target
        }
     }
   });

   return (<div>
            <h3>{title}</h3>
            <p>{isLoading ? 'Logging In???' : 'Login' }</p>
            <form onSubmit={handleFormSubmit} name={"login"} method={"post"}>
               <input name={"email"} type={"email"} value={state.formSubmitPayload.email}  onChange={onInputChange} />
               <input name={"password"} type={"password"} value={state.formSubmitPayload.password} onChange={onInputChange} />
               <button type={"submit"} disabled={!state.isSubmitButtonEnabled}>Login</button>
            </form>
            {isError && <span className={"error"}>{error.message}</span>}
           </div>)
}

export default LoginForm
```
## License

MIT License

## Documentation
>busser is made up of ReactJS hooks as follows:

- `useList()`: used to manage a list (array) of things (objects, strings, numbers e.t.c
- `useCount()`: used to manage counting things (items in a list (array) of things or clicks or events)
- `useRouted()`: used to respond to a SPA page navigation events.
- `useComposite()`: used to respond to a set of composite states.
- `usePromised()`: used to execute any async task with a deffered or promised value triggered by any app event
- `useTextFilteredList()`: used to filter a list (array) of things based on a search text being typed into an input


## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```
