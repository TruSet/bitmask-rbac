import EthereumClient from './EthereumClient'
import { toWei } from 'web3-utils'

class MetamaskService extends EthereumClient {
  constructor(provider, contractState, account) {
    super(provider, contractState)

    // Workaround for a MetaMask issue whereby the gas price sometimes defaults to zero on the xDai chain
    // Should be removed if/when MetaMask is fixed.
    this.transactionOpts = process.env['REACT_APP_HUB_ADDRESS_100']
      ? { from: account, gasPrice: toWei('2', 'gwei') }
      : { from: account }
  }


  createUser({ address, display, roles }) {
    return this.rbac.methods
      .newUser(address, display, roles)
      .send(this.transactionOpts)
  }


  setNodeDisplay({ nodeAddress, display }) {
    return this.rbac.methods
      .setUserDisplay(nodeAddress, display)
      .send(this.transactionOpts)
  }

  setUser({ nodeAddress, display, roles }) {
    return this.rbac.methods
      .setUser(nodeAddress, display, roles)
      .send(this.transactionOpts)
  }
}

export default MetamaskService
