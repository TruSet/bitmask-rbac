/**
 * EthWatcher
 * is a layer between the application and the Ethereum blockchain.
 * It boots at application startup and it opens a websocket connection with
 * a node in the blockchain.
 * It analyzes events received through the websocket and it converts them in
 * Redux actions, to finally apply changes to Redux state. React will
 * consequently perform changes in the affected pages.
 */
import { Eth } from 'web3-eth'
import {
  setDisplay,
  roleAdded,
  roleRemoved,
} from '../reducers/users'
import Web3 from 'web3'
import store from './store'
import rbacContractJson from '../contracts/BitmaskRBAC.json'

class EthWatcher {
  constructor(ethereumClient) {
    this.watch = this.watch.bind(this)
    this.startWatching = this.startWatching.bind(this)
    this.ethereumClient = ethereumClient
  }

  startWatching() {
    let contractState = store.getState().contracts
    const endpoint = contractState.endpoint
    this.provider = new Web3.providers.WebsocketProvider(endpoint)
    // For testing connection closing
    // setTimeout(() => {
    //   this.provider.connection.close()
    // }, 5000)

    this.web3Eth = new Eth(endpoint) // N.B. Re-using the provider object above seems to cause subscriptions to miss events
    this.provider.connection.onopen = this.watch
    this.provider.connection.onclose = this.startWatching
  }

  watch() {
    let contractState = store.getState().contracts

    let rbacContract = new this.web3Eth.Contract(
      rbacContractJson.abi,
      contractState.rbacAddress
    )

    const startBlock = 'latest'

    if (this.unsubscribeFunc) {
      // clean up any old subscription
      this.unsubscribeFunc()
      delete this.unsubscribeFunc
      this.watchedInstruments = []
    }

    this.unsubscribeFunc = store.subscribe(() => {})

    rbacContract.events
      .allEvents({ fromBlock: startBlock })
      .on('data', eventLog => {
        let userAddress = eventLog.returnValues.addr
        let roleName = eventLog.returnValues.roleName
        let display = eventLog.returnValues.display
        switch (eventLog.event) {
          case 'DisplayChanged':
            store.dispatch(setDisplay(userAddress, display))
            break
          case 'RoleAdded':
            store.dispatch(roleAdded(userAddress, roleName))
            break
          case 'RoleRemoved':
            store.dispatch(roleRemoved(userAddress, roleName))
            break
          default:
            break
        }
      })
      .on('error', error =>
        console.error('RBAC log subscription error:', error)
      )

  }
}

export default EthWatcher
