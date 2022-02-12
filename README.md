[![Generic badge](https://img.shields.io/badge/ReactJS-Yes-purple.svg)](https://shields.io/) ![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# busser
An evented object for scalable and performant communication across ReactJS Components. 

## Motivation

It's very easy to get [React Context](https://reactjs.org/docs/context.html) wrong which can lead to re-render hell for your react apps. Also, over-using props to pass data around can slow [React](https://reactjs.org/) down by a lot. What this package seeks to achieve is to not limit the communication between React components to props and through parent components alone. It is to utilize the `Mediator Pattern` to allow components communicate in a more scalable way. This package was inspired partially by [**react-bus**](https://www.github.com/goto-bus-stop/react-bus). This package can also be used well with [**react-query**](https://github.com/tannerlinsley/react-query) to create logic that can work hand-in-hand to promote less boilerplate for repititive react logic (e.g. data fetching + management) and promote clean code.

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
   const bus = useEventListener(eventName, ({ payload, componentName }) => {
    return boundFetcher({
      method: 'POST',
      data: payload,
      metadata: { componentName, verb: 'post' }
    })
   }, [])

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
   }, [list, toggle], false)

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
import { useUIStateManager, useUIDataFetcher, useEventBus } from 'busser'

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
   const componentBus = useEventListener(eventName, ({ form, componentName }) => {
     return mutate({
        data: new FormData(form),
        metadata: { componentName }
     })
  }, [mutate]);

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
