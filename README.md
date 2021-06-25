# busser
an evented object for scalable and precise communication across ReactJS Components

## Getting Started
>To get started using the `busser` package, you need to import the `useEventBus()` hook into your component

```jsx
import * as React from 'react'
import { useUIStateManager, useUIDataFetcher, useEventBus } from 'busser'

function LoginForm ({ title }) {
   const initialState = {
     isLoading: true,
     isSubmitting: false,
     isSubmitButtonEnabled: true,
     formSubmitPayload: {
       email: null,
       password: null
     }
   }
   const updaterCallback = function (event, { success, error, metadata }) => {
       return {
         isSubmitting: event === 'request:started' ? error === null : false,
         isSubmitButtonEnabled: event === 'request:started' ?  false : success !== null
       }
   }
   const [state, setState] = useUIStateManager(initialState, updaterCallback);
   const { fetchData, fetchError, fetcher } = useUIDataFetcher({
     httpClientDriverName = 'axios',
     defaultFetchData = null,
     defaultFetchError = null,
   });
   const events = ['request:start']
   const componentBus = useEventBus(events, events);

   useEffect(() => {
     if (state.isLoading) {
       setState({ ...state, isLoading: false })
     }

     const [ event ] = events
     componentBus.on(event, ({ url, method, payload }) => {
        return fetcher({
           url,
           method,
           data: payload
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
import * as React from 'react'
import { useEventBus } from 'busser'

function ToastPopup() {
   const events = ['request:ended']
   const componentBus = useEventBus(events, [])
   const [ toggle, setToggle] = useState({ show: false })
   
   useEffect(() => {
      const [ event ] = events
      componentBus.on(event, ({ error, success, metadata }) => {
         setToggle({ show: true })
      })

      return () => {
         componentBus.off()
      }
   }, [])
   
   return (
      !toggle.show ? null : <aside></aside>
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
           <ToastPopup />
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
