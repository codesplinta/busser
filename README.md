# busser
an evented object for scalable and precise communication across ReactJS Components. Over using props can slow React down by a lot. What this package seeks to achieve is to not limit the communication between React components to props and through parent components alone. It is to utilize the `Mediator Pattern` to allow components communicate in a more scalable way. This package can also be used well with [**React Query**](https://github.com/tannerlinsley/react-query) to create logic that can work hand-in-hand to promote less boilerplate for repititive react logic (e.g. data fetching + management) and promote clean code.

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
>To get started using the `busser` package, you need to import the `useEventBus()` hook into your component

```jsx
import * as React from 'react'
import { useUIStateManager, useUIDataFetcher, useFetchBinder, useEventBus } from 'busser'

function LoginForm ({ title }) {
   const initialState = {
     isLoading: true,
     isSubmitting: false,
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }
   const updaterCallback = function (event, { success, error, metadata }) => {
       return {
         isSubmitting: event === 'request:started' ? error === null : false,
         isSubmitButtonEnabled: event === 'request:started' ?  false : success !== null
       }
   }
   const [state, setState] = useUIStateManager(initialState, [], updaterCallback);
   const { connectToFetcher } = useUIDataFetcher({
      customizePayload: (response) => {
         return (response.body || response).data
      }
   });
   const { fetchData, fetchError, boundFetcher } = useFetchBinder(connectToFetcher)

   const events = ['request:start']
   const componentBus = useEventBus(events, events);

   useEffect(() => {
     if (state.isLoading) {
       setState({ ...state, isLoading: false })
     }

     const [ event ] = events
     componentBus.on(event, ({ url, method, payload, componentName }) => {
        return boundFetcher({
           url,
           method,
           data: payload,
           metadata: { componentName }
        })
     })

     return () => {
        componentBus.off()
     }
   }, []);


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
     const [ event ] = events
     componentBus.emit(event, {
       url: 'http://localhost:6700/api/login',
       method: 'POST',
       payload: uiState.formSubmitPayload,
       componentName: 'LoginForm'
     });
   }

   return (<div>
            <h3>{title}</h3>
            <p>{state.isSubmitting ? 'Logging In…' : 'Login' }</p>
            <form onSubmit={handleFormSubmit}>
               <input name=“email” type=“email” value={state.formSubmitPayload.email}  onChange={onInputChange}>
               <input name=“password” type=“password” value={state.formSubmitPayload.password} onChange={onInputChange}>
               <button type=“submit” disabled={!state.isSubmitButtonEnabled}>Login</button>
            </form>
           </div>)
} 

export default LoginForm
```

```jsx
import React, { useState, useEffect } from 'react'
import { useEventBus } from 'busser'

function ToastPopup({ position, timeout }) {
   const events = ['request:ended']

   const componentBus = useEventBus(events)
   const [ list, setList ] = useState([])
   const [ toggle, setToggle ] = useState({ show: false })
   const struct = {
      iconLink: null,
      color: '',
      message: '',
      title: ''
   }
   
   useEffect(() => {
      const [ event ] = events
      componentBus.on(event, ({ error, success, metadata }) => {
         const listCopy = list.slice(0)
         const structCopy = { ...struct }

         structCopy.title = metadata.requestType
         structCopy.message = error !== null ? 'Request Failed' : 'Request Succeded'
         structCopy.color = error !== null ? 'red' :  'green'

         listCopy.unshift(structCopy)

         setList(listCopy)
         setToggle({ show: true })
      })

      return () => {
         componentBus.off()
      }
   }, [])

   const handleToastClose = (e) => {
      e.stopPropagation();

      const listCopy = list.slice(0);
      delete listCopy[0];

      setList(listCopy)
      setToggle({ show: false })
   }

   useEffect(() => {
     setTimeout(() => {
       handleToastClose(new Event('click'))
     }, parseInt(timeout))
   }, [toggle])

   return (
      !toggle.show 
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
   )
}

export default ToastPopup
```

>Setup the `App.jsx` file that holds the entry point to the React app

```jsx
import axios from 'axios'
import logo from './logo.svg'
import LoginForm from './src/LoginForm'
import ToastPopup from './src/ToastPopup'
import "./App.css"
import { registerHttpClientDriver } from 'busser'

registerHttpClientDriver({
  'axios': axios
})

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
import { EventBusProvider } from 'busser'
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './App'

function Root() {

  return (
    <EventBusProvider>
      <App />
    </EventBusProvider>
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
     isLoading: true,
     isSubmitting: false,
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: '',
       password: ''
     }
   }
   const updaterCallback = function (event, { success, error, metadata }) => {
       return {
         isSubmitting: event === 'request:started' ? error === null : false,
         isSubmitButtonEnabled: event === 'request:started' ?  false : success !== null
       }
   }
   const [state, setState] = useUIStateManager(initialState, [], updaterCallback)
   const { fetcher } = useUIDataFetcher()
   const queryClient = useQueryClient()
   const { mutate, error, data, isFetching } = useMutation(
     ({ url, data, metadata }) => fetcher({ url, method: 'POST', payload: data, metadata }),
     {
       onSuccess: (data, variables) => {
         // queryClient.invalidateQueries('auth')
         queryClient.setQueryData(['auth', { id: variables.id }], data)
       }
     }
   )

   const events = ['request:start']
   const componentBus = useEventBus(events, events);

   useEffect(() => {
     if (state.isLoading) {
       setState({ ...state, isLoading: false })
     }

     const [ event ] = events
     componentBus.on(event, ({ url, method, form, componentName }) => {
        return mutate({
           url,
           data: new FormData(form),
           metadata: { componentName }
        })
     })

     return () => {
        componentBus.off()
     }
   }, []);

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
     const [ event ] = events
     componentBus.emit(event, {
       url: 'http://localhost:6700/api/login',
       method: 'POST',
       form: e.target,
       componentName: 'LoginForm'
     });
   }

   return (<div>
            <h3>{title}</h3>
            <p>{state.isSubmitting ? 'Logging In…' : 'Login' }</p>
            <form onSubmit={handleFormSubmit}>
               <input name=“email” type=“email” value={state.formSubmitPayload.email}  onChange={onInputChange}>
               <input name=“password” type=“password” value={state.formSubmitPayload.password} onChange={onInputChange}>
               <button type=“submit” disabled={!state.isSubmitButtonEnabled}>Login</button>
            </form>
           </div>)
}

export default LoginForm
```
