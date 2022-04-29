[![Generic badge](https://img.shields.io/badge/ReactJS-Yes-purple.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# busser
An evented object for scalable and performant communication across ReactJS Components. 

## Motivation

It's very easy to get [React Context](https://reactjs.org/docs/context.html) wrong which can lead to re-render hell for your react apps. Also, over-using props to pass data around or trigger state changes can slow [React](https://reactjs.org/) down by a lot. You might say: "So ? that's why React context came into being - to help avoid prop drilling" and you'd be partly right but [React context has it's own drawbacks too](https://blog.logrocket.com/pitfalls-of-overusing-react-context/). The deeper the component tree of a React app is, the slower at rendering (and re-rendering) the app becomes when using mostly props/context. What this method of setting up data passing amongst React components tries to achieve is to **"prune the leaves"** of the component tree. This makes the entire component tree faster at re-rending by making the children of erstwhile parent components siblings. What this package seeks to promote therefore is to not limit the communication between React components to props/context and through parent components alone. It is to utilize the `Mediator Pattern` (event bus) to allow components communicate in a more constrained yet scalable way. This package was inspired partially by [**react-bus**](https://www.github.com/goto-bus-stop/react-bus). This package can also be used well with [**react-query**](https://github.com/tannerlinsley/react-query) to create logic that can work hand-in-hand to promote less boilerplate for repititive react logic (e.g. data fetching + management) and promote clean code.

>There are 2 major reasons why it's important to "prune the leaves" of React component tree for your app

The virtual DOM is vital to how React works but also presents challenges of it's own in the manner in which it works:

1. **Diff Algorithm keeps on updating leaf nodes that do not need to be updated**: ... where you might end up with [bugs like this one](https://www.eventbrite.com/engineering/a-story-of-react-re-rendering-bug).

2. **Heavy CPU computation due to Diff algorithm updating components**: .. computing the difference between the real DOM and virtual is usually expensive.

So, instead of growing the component tree depth-wise, grow it breadth-wise.

## Old Concepts, New Setup

This concept of an event bus employed to pass data around in parts of a frontend web applications isn't new. The pub/sub concept have been around for a long time in software developemnt but what has plagued its use at scale has been lack of the correct and adequate technical contraints at scale. It's very easy to overuse and by consequence get overwhelmed by the sheer number and frquency of events and data being fired and passed around respectively. The biggest problem is managing the predicatability and flow of these events. So, this project proposed 2 specific ways to communicate across components (as broadcasts):

- cascade broadcasts
- circular broadcasts

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
>To get started using the `busser` package, you need to import the `useEventBus()` hook (optionally) into your component to emit and listen to events. Then, import the `useEventListener()` to listen for events. 

```jsx
import * as React from 'react'
import { useUIStateManager, useUIDataFetcher, useFetchBinder, useEventListener } from 'busser'

function LoginForm ({ title }) {
   const initialState = {
     isSubmitting: false,
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }
   const updaterCallback = (event, state, { success, error, metadata }) => {
       return {
         ...state,
         isSubmitting: event === 'request:started' ? error === null : false,
         isSubmitButtonEnabled: event === 'request:started' ?  false : success !== null
       }
   }
   const [ state, setState ] = useUIStateManager(initialState, [], updaterCallback);
   const { connectToFetcher } = useUIDataFetcher({
      url: 'http://localhost:6700/api/login',
      customizePayload: (response) => {
         return (response.body || response).data
      }
   });
   const { fetchData, fetchError, boundFetcher } = useFetchBinder(connectToFetcher)
   const eventName = "request:start"
   const [ bus ] = useEventListener(eventName, ({ payload, componentName }) => {
    return boundFetcher({
      method: 'POST',
      data: payload,
      metadata: { componentName, verb: 'post' }
    })
   }, 'LoginForm.component')

   const onInputChange = (e) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [e.target.name]: e.target.value 
        }
      })
   }

   const handleFormSubmit = (e) => {
     e.preventDefault();
     bus.emit(eventName, {
       payload: state.formSubmitPayload,
       componentName: 'LoginForm'
     });
   }

   if (state.isComponentLoading) {
     return (<span>Loading...</span>)
   }

   return (<div>
            <h3>{title}</h3>
            <p>{state.isSubmitting ? 'Logging In…' : 'Login' }</p>
            <form onSubmit={handleFormSubmit}>
               <input name="email" type="email" value={state.formSubmitPayload.email}  onChange={onInputChange} />
               <input name="password" type="password" value={state.formSubmitPayload.password} onChange={onInputChange} />
               <button type="submit" disabled={!state.isSubmitButtonEnabled}>Login</button>
            </form>
           </div>)
} 

export default LoginForm
```

```jsx
import React, { useState, useEffect } from 'react'
import { useEventListener } from 'busser'

function ToastPopup({ position, timeout }) {

   const [ list, setList ] = useState([])
   const [ toggle, setToggle ] = useState({ show: false })
   const struct = {
      iconLink: null,
      color: '',
      message: '',
      title: ''
   }

   useEventListener('request:ended', ({ error, success, metadata }) => {
      const listCopy = list.slice(0)
      const structCopy = { ...struct }

      structCopy.title = metadata.requestType
      structCopy.message = error !== null ? 'Request Failed' : 'Request Succeded'
      structCopy.color = error !== null ? 'red' :  'green'

      listCopy.unshift(structCopy)

      setList(listCopy)
      setToggle({ show: true })
   }, 'ToastPopup.component', [list, toggle])

   const handleToastClose = (e) => {
     if (e !== null) {
      e.stopPropagation();
     }

      const listCopy = list.slice(0);
      delete listCopy[0];

      setList(listCopy)
      setToggle({ show: false })
   }

   useEffect(() => {
     setTimeout(() => {
       handleToastClose(null)
     }, parseInt(timeout))
   }, [toggle, handleToastClose])

   return (
      {!toggle.show 
        ? null 
        : <div className={`notification-container ${position}`}
           list.map(({ iconLink, title, message, color }) => <div className={`notification toast ${color}`}>
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
import "./App.css"

function App () {
  return (
     <div className="App">
        <header className="App-Header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to RapConf</h1>
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

import * as React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useUIStateManager, useUIDataFetcher, useEventListener } from 'busser'

function LoginForm ({ title }) {
   const initialState = {
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }
   const updaterCallback = (event, state, { success, error, metadata }) => {
       return {
         isSubmitButtonEnabled: event === 'request:started' ?  false : success !== null
       }
   }
   const [ state, setState ] = useUIStateManager(initialState, [], updaterCallback)
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
   const [ componentBus, statistics ] = useEventListener(eventName, ({ form, componentName }) => {
     return mutate({
        data: new FormData(form),
        metadata: { componentName }
     })
  }, 'LoginForm.component', [mutate]);

   React.useEffect(() => {
      if (data !== null) {
         window.localStorage.setItem('user', JSON.stringify(data));
      } else {
         window.localStorage.clearItem('user')
      }
   }, [data])

   const onInputChange = (e) => {
      setState({
        ...state,
        formSubmitPayload:{
          ...state.formSubmitPayload,
          [e.target.name]: e.target.value 
        }
      })
   }

   const handleFormSubmit = (e) => {
     e.preventDefault();

     componentBus.emit(eventName, {
       form: e.target,
       componentName: 'LoginForm'
     });
   }

   if (state.isComponentLoading) {
     return (<span>Loading...</span>)
   }

   return (<div>
            <h3>{title}</h3>
            <p>{isLoading ? 'Logging In…' : 'Login' }</p>
            <form onSubmit={handleFormSubmit} name={"login"} method={"post"}>
               <input name="email" type="email" value={state.formSubmitPayload.email}  onChange={onInputChange} />
               <input name="password" type="password" value={state.formSubmitPayload.password} onChange={onInputChange} />
               <button type="submit" disabled={!state.isSubmitButtonEnabled}>Login</button>
            </form>
            {isError && <span className="error">{error.message}</span>}
           </div>)
}

export default LoginForm
```
## License

MIT License

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```
