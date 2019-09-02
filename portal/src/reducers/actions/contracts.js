import { getEndpointForNetworkID } from '../../lib/network'

export const SET_NETWORK = 'SET_NETWORK'
export const RESET_PERSISTED_STATE = 'RESET_PERSISTED_STATE'
export const LOAD_CONTRACTS = 'LOAD_CONTRACTS'

export const loadContracts = (networkID, metamaskNetworkID) => async (
  dispatch,
  getState
) => {
  let rbacAddress = process.env['REACT_APP_RBAC_ADDRESS_' + networkID]
  let endpoint = getEndpointForNetworkID(networkID)

  dispatch({
    type: LOAD_CONTRACTS,
    networkID,
    metamaskNetworkID,
    endpoint,
    rbacAddress,
  })
}

export const setNetwork = networkID => ({
  type: SET_NETWORK,
  networkID,
  endpoint: getEndpointForNetworkID(networkID),
})

export const resetPersistedState = () => dispatch =>
  dispatch({
    type: RESET_PERSISTED_STATE,
  })
