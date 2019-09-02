import { persistStore } from 'redux-persist'
import store from './store'

export default () => {
  const persistor = persistStore(store)
  return { store, persistor }
}
