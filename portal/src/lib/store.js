import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import metamaskStatus from '../reducers/metamaskStatus'
import miningStatus from '../reducers/miningStatus'
import contracts from '../reducers/contracts'
import user from '../reducers/user'
import users from '../reducers/users'
import { metamaskMiddleware } from '../reducers/actions/metamaskMiddleware'
import { persistReducer } from 'redux-persist'

import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native

const composeEnhancers =
  // process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose

const preloadedState = window.__PRELOADED_STATE__

delete window.__PRELOADED_STATE__

const cachedReducers = {
  users,
  contracts,
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: Object.keys(cachedReducers),
}

const rootReducer = combineReducers({
  ...cachedReducers,
  metamaskStatus,
  miningStatus,
  user,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

let middlewares = [thunk, metamaskMiddleware]

if (process.env.NODE_ENV === 'development') {
  const freeze = require('redux-freeze')
  middlewares.push(freeze)
}

const store = createStore(
  persistedReducer,
  preloadedState,
  composeEnhancers(applyMiddleware(...middlewares))
)

export default store
