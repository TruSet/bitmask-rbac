import _ from 'lodash'

export const getEndpointForNetworkID = networkID => {
  return process.env['REACT_APP_WEBSOCKETS_ENDPOINT_' + networkID]
}

export const isSupportedNetwork = networkID => {
  const rbacAddress = process.env['REACT_APP_RBAC_ADDRESS_' + networkID]
  return !_.isUndefined(rbacAddress)
}

export const suggestedNetworkID = () => {
  if (process.env['REACT_APP_RBAC_ADDRESS_100']) {
    return 100
  } else {
    return 4
  }
}
