export const STATUS = 'STATUS'

export const initialState = {
  pendingSignature: false,
  showMetamaskRejected: false,
}

export default (state = initialState, action) => {
  if (!action) return state
  switch (action.type) {
    case STATUS:
      return {
        ...state,
        pendingSignature:
          typeof action.pendingSignature !== 'undefined'
            ? action.pendingSignature
            : state.pendingSignature,
        showMetamaskRejected:
          typeof action.showMetamaskRejected !== 'undefined'
            ? action.showMetamaskRejected
            : state.showMetamaskRejected,
        showClosePhaseUnavailable:
          typeof action.showClosePhaseUnavailable !== 'undefined'
            ? action.showClosePhaseUnavailable
            : state.showClosePhaseUnavailable,
      }
    default:
      return state
  }
}

export const showMetamaskOverlay = status => {
  return {
    type: STATUS,
    pendingSignature: status,
  }
}

export const showClosePhaseUnavailable = status => {
  return {
    type: STATUS,
    showClosePhaseUnavailable: status,
  }
}

export const metamaskTransactionRejected = () => {
  return dispatch => {
    dispatch({
      type: STATUS,
      pendingSignature: false,
      showMetamaskRejected: true,
    })
    // We hide the "Rejected" popup after 7 seconds
    setTimeout(() => {
      dispatch({
        type: STATUS,
        pendingSignature: false,
        showMetamaskRejected: false,
      })
    }, 7000)
  }
}
