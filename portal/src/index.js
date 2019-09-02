import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import EthProvider from './contexts/EthProvider'
import configureStore from './lib/configureStore'
import App from './components/App'
import { PersistGate } from 'redux-persist/integration/react'

export const { store, persistor } = configureStore()

ReactDOM.render(
  <Fragment>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <EthProvider>
          <App />
        </EthProvider>
      </PersistGate>
    </Provider>
  </Fragment>,
  document.getElementById('root')
)

document.title = 'RBAC'
