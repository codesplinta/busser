# busser
an evented object for scalable and precise communication across ReactJS Components

## Getting Started
>To get started using the `busser` package, you need to import the `useEventBus()` hook into your component

```jsx
import { useUIStateManager, useUIDataFetcher, useEventBus } from 'busser'

export function LoginForm ({ title }) {
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

     componentBus.on('request:start', ({ url, method, payload }) => {
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
     componentBus.emit('request:start', {
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
```
>Then, in the `index.js` file of your project, do this:

```jsx
import { EventBusProvider } from 'busser'
import App from './App'

function Root() {

  return (
    <EventBusProvider>
      <App />
    </EventBusProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'))
```
