import _ from 'lodash'
import { Eth } from 'web3-eth'
import rbacContractJson from '../contracts/BitmaskRBAC.json'

class EthereumClient {
  constructor(provider, contractState) {
    this.web3Eth = new Eth(provider)

    this.rbac = new this.web3Eth.Contract(
      rbacContractJson.abi,
      contractState.rbacAddress
    )
  }

  // Queries
  // > Users
  async userCount() {
    let userCountResult = await this.rbac.methods.getUserCount().call()
    return parseInt(userCountResult, 10)
  }

  getTransactionReceipt(hash) {
    return this.web3Eth.getTransactionReceipt(hash)
  }

  async getUser(address) {
    try {
      let [
        display,
        role,
      ] = await Promise.all([
        this.rbac.methods.getUserDisplay(address).call(),
        this.rbac.methods.getUserRoleBitmask(address).call()
      ])

      role = parseInt(role, 10)

      return {
        address,
        display,
        role,
      }
    } catch (error) {
      console.error('error looking up user: ', error)
    }
  }

  async getUsers({ startIndex, count }) {
    const userIndices = _.range(startIndex, startIndex + count)

    const userAddressRequests = userIndices.map(i =>
      this.rbac.methods.userList(i).call()
    )

    const userAddresses = await Promise.all(userAddressRequests)

    const userRequestsFlat = userAddresses.flatMap(address => [
      this.rbac.methods.getUserDisplay(address).call(),
      this.rbac.methods.getUserRoleBitmask(address).call(),
    ])
    const results = await Promise.all(userRequestsFlat)

    let users = _.chunk(results, 4)

    return users.map(([display, role, balance, stakedBalance], id) => ({
      address: userAddresses[id],
      display,
      id,
      balance: parseInt(balance, 10),
      role: parseInt(role, 10),
    }))
  }

}

export default EthereumClient
