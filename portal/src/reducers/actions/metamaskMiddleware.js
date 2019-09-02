import {
  metamaskTransactionRejected,
  showMetamaskOverlay,
} from '../metamaskStatus'

import {
  transactionFailed,
  transactionMined,
  transactionSent,
} from '../miningStatus'
import MetamaskService from '../../services/MetamaskService'

export const metamaskMiddleware = ({ dispatch, getState }) => {
  return next => action => {
    const {
      metamaskClientFunction,
      metamaskClientFunctionArgs,
      humanWaitPrompt = 'Please wait while transaction is confirmed',
      transactionHashCallback = hash => {},
      callback = result => {},
    } = action

    if (!metamaskClientFunction) {
      // onward
      return next(action)
    }

    let currentHash
    const metamaskClient = new MetamaskService(
      window.web3.currentProvider,
      getState().contracts,
      getState().user.user.address
    )

    dispatch(showMetamaskOverlay(true))
    metamaskClient[metamaskClientFunction](...metamaskClientFunctionArgs)
      .once('transactionHash', hash => {
        currentHash = hash
        transactionHashCallback(hash)
        dispatch(showMetamaskOverlay(false))
        dispatch(transactionSent(hash, humanWaitPrompt))
      })
      .once('confirmation', (number, receipt) => {
        dispatch(transactionMined(receipt))
        callback(receipt)
      })
      .on('error', err => {
        // In the simplest case, this could mean that the user decided not to sign the transaction
        dispatch(showMetamaskOverlay(false))
        dispatch(metamaskTransactionRejected())

        if (currentHash) {
          // Transaction was signed by Metamask so something has gone wrong. Note that if a transaction is
          // mined but fails, we do not always see a 'confirmation' event (even though a receipt exists).
          console.error(err)
          dispatch(transactionFailed(currentHash))
        }
        callback(null, err)
      })
      .catch(console.error)
  }
}
