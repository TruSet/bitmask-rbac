import moment from 'moment'

export const TRANSACTION_SENT = 'TRANSACTION_SENT'
export const TRANSACTION_MINED_AND_SUCCEEDED = 'TRANSACTION_MINED_AND_SUCCEEDED'
export const TRANSACTION_FAILED = 'TRANSACTION_FAILED'

// Transaction types
/*
unminedTransaction:
{
  type: TX_TYPE,
  hash: string,
  description: string, // describes the transaction from a user PoV, for use in the UI
  mineInBackground: boolean, // difference between blockingUnminedTransaction and backgroundUnminedTransaction
}

completedTransaction:
{
  request: unminedTransaction,
  receipt: transaction receipt, // Optional; only transactions that were mined (successfully or unsuccessfully) will have a receipt
}
*/
export const initialState = {
  message: '', // A message to be displayed on screen during blocking transactions
  lastMinedTimestamp: 0,
  blockingUnminedTransactions: [], // structured as unminedTransaction per definition above
  backgroundUnminedTransactions: [], // structured as unminedTransaction per definition above
  successfulTransactions: [], // structured as completedTransaction per definition above; should always have a receipt
  failedTransactions: [], // structured as completedTransaction per definition above; may or may not have a receipt
}

export default (state = initialState, action) => {
  if (!action) {
    return state
  }
  const {
    blockingUnminedTransactions,
    successfulTransactions,
    failedTransactions,
    backgroundUnminedTransactions,
  } = state

  switch (action.type) {
    case TRANSACTION_SENT:
      if (action.transactionRequest.mineInBackground) {
        return {
          ...state,
          message: action.message,
          backgroundUnminedTransactions: [
            ...backgroundUnminedTransactions,
            action.transactionRequest,
          ],
        }
      } else {
        return {
          ...state,
          message: action.message,
          blockingUnminedTransactions: [
            ...blockingUnminedTransactions,
            action.transactionRequest,
          ],
        }
      }
    case TRANSACTION_MINED_AND_SUCCEEDED:
      let requestDetails = blockingUnminedTransactions
        .concat(backgroundUnminedTransactions)
        .filter(tx => tx.hash === action.receipt.transactionHash)
      let newSuccessfulTransaction = {
        request: requestDetails[0],
        receipt: action.receipt,
      }
      return {
        ...state,
        lastMinedTimestamp: moment().unix(),
        message: '',
        blockingUnminedTransactions: blockingUnminedTransactions.filter(
          tx => tx.hash !== action.receipt.transactionHash
        ),
        backgroundUnminedTransactions: backgroundUnminedTransactions.filter(
          tx => tx.hash !== action.receipt.transactionHash
        ),
        successfulTransactions: {
          ...successfulTransactions,
          [action.receipt.transactionHash]: newSuccessfulTransaction,
        },
      }
    case TRANSACTION_FAILED:
      // Several cases can get us here, most commonly:
      // - Assert failed in a smart contract (transaction was mined)
      // - Require failed in a smart contract (transaction was mined)
      // - Insufficient gas included in the trx (transaction was mined)
      // - Connectivity issue (transaction was probably not mined)
      // - Network congestion / gas price too low (transaction was not mined... yet)
      // - Incorrect transaction nonce (development chains only; transaction was not mined)
      //
      // MetaMask emits an 'error' event for all of these scenarios, so it's simplest to
      // treat them all the same for now. But if we want to discriminate in future we
      // could look for transaction receipts and examine Error messages.
      //
      // We can and do see this action multiple times for a given transaction, so we take
      // care to avoid duplicates.
      let newRequestDetails = blockingUnminedTransactions
        .concat(backgroundUnminedTransactions)
        .filter(tx => tx.hash === action.transactionHash)
      let existingTrxState = state.failedTransactions[action.transactionHash]
      let existingTrxRequest = existingTrxState
        ? existingTrxState.request
        : undefined
      let existingTrxReceipt = existingTrxState
        ? existingTrxState.receipt
        : undefined
      let newFailedTransaction = {
        request: newRequestDetails[0] || existingTrxRequest,
        receipt: action.receipt || existingTrxReceipt,
      }
      return {
        ...state,
        message: '',
        blockingUnminedTransactions: blockingUnminedTransactions.filter(
          tx => tx.hash !== action.transactionHash
        ),
        backgroundUnminedTransactions: backgroundUnminedTransactions.filter(
          tx => tx.hash !== action.transactionHash
        ),
        // We can be called for already-failed transactions and must not duplicate items in our list
        failedTransactions: {
          ...failedTransactions,
          [action.transactionHash]: newFailedTransaction,
        },
      }
    default:
      return state
  }
}

// string, string, TX_TYPE
export const transactionSent = (hash, message, transactionType) => {
  let transactionRequest = {
    type: transactionType,
    hash,
    description: message,
    mineInBackground: false,
  }

  // For now, the only transactions we choose to mine in the background (i.e. not blocking in the UI)
  // are voting transactions (the most common transaction type)

  return { type: TRANSACTION_SENT, message, transactionRequest }
}

export const transactionMined = receipt => {
  if (receipt.status === false) {
    return {
      type: TRANSACTION_FAILED,
      receipt,
      transactionHash: receipt.transactionHash,
    }
  } else {
    return {
      type: TRANSACTION_MINED_AND_SUCCEEDED,
      receipt,
    }
  }
}

export const transactionFailed = transactionHash => ({
  type: TRANSACTION_FAILED,
  transactionHash,
})
