import _ from 'lodash'
import { LOAD_CONTRACTS, SET_NETWORK } from './actions/contracts'

export const initialState = {
  rbacAddress: null,
  networkID: null,
  endpoint: null,
}

export default (state = initialState, action) => {
  if (!action) return state
  switch (action.type) {
    case LOAD_CONTRACTS:
      let contractNetwork = _.omit(action, ['type'])
      return {
        ...state,
        ...contractNetwork,
      }
    case SET_NETWORK:
      return {
        ...state,
        networkID: action.networkID,
        endpoint: action.endpoint,
      }
    default:
      return state
  }
}
