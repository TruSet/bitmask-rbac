import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { Eth } from 'web3-eth'
import Web3 from 'web3'
import EthContext from './EthContext'
import EthereumClient from '../services/EthereumClient'
import EthWatcher from '../lib/ethWatcher'
import {
  metamaskIsApproved,
  metamaskIsEnabled,
  metamaskIsUnlocked,
} from '../lib/web3Onboarding'
import { isSupportedNetwork, suggestedNetworkID } from '../lib/network'
import { initializeState } from '../reducers/actions/initialDataLoad'
import { userInitialLoad } from '../reducers/actions/user'
import {
  loadContracts,
  setNetwork,
  resetPersistedState,
} from '../reducers/actions/contracts'
import { persistor } from '../index'

class EthProvider extends Component {
  state = {
    approved: false,
    enabled: false,
    loading: true,
    unlocked: false,
    web3Available: !_.isUndefined(window.web3),
  }

  async componentDidMount() {
    let networkID = suggestedNetworkID()
    let networkIDResponse = suggestedNetworkID()
    const unlocked = await metamaskIsUnlocked()
    // most recent version of metamask supports window.ethereum.enable() to get
    // default account (EIP 1102)
    // set up account and chain connections
    if (!_.isUndefined(window.ethereum) && unlocked) {
      try {
        const [defaultAccount] = await window.ethereum.enable()
        this.defaultAccount = defaultAccount
      } catch (error) {
        console.error('User dismissed app access to metamask', error)
      }
    }

    // Now we fallback to using window.web3 instead of its replacement window.ethereum, because this
    // interface is compatible with more web3 browsers. The following code is executed if any web3 provider is present
    if (!_.isUndefined(window.web3)) {
      let web3Eth = new Eth(window.web3.currentProvider)
      if (!this.defaultAccount) {
        // Legacy web3 provider, so we didn't already get the accounts from window.ethereum.enable
        // Get them now
        const [defaultAccount] = await web3Eth.getAccounts()
        this.defaultAccount = defaultAccount
      }

      // We now have a web3 provider and know our accounts.
      // Loop until MetaMask is in the state we need
      this.getMetamaskState()
      this.looper = setInterval(() => {
        this.getMetamaskState()
      }, 500)

      networkIDResponse = await this.getNetworkId(web3Eth)
      if (unlocked && isSupportedNetwork(networkIDResponse)) {
        networkID = networkIDResponse
      }
    }
    // check if network id has changed
    const cachedNetworkID = this.props.contracts.networkID
    const cachedRbacAddress = this.props.contracts.rbacAddress

    if (
      cachedNetworkID !== networkID ||
      cachedRbacAddress !== process.env['REACT_APP_RBAC_ADDRESS_' + networkID] ||
      _.isUndefined(cachedRbacAddress)
    ) {
      if (cachedNetworkID) {
        await persistor.purge()
        this.props.resetPersistedState()
      }
      this.props.setNetwork(networkID)
    }
    await this.connectToNetwork(networkID, networkIDResponse)
  }

  async connectToNetwork(networkID, metamaskNetworkID) {
    if (isSupportedNetwork(networkID)) {
      await this.props.loadContracts(networkID, metamaskNetworkID)
      this.connectWebsocket()
      if (!_.isUndefined(window.web3)) {
        if (!this.defaultAccount) {
          this.defaultAccount = window.web3 && window.web3.eth.defaultAccount
        }
        if (this.defaultAccount) {
          const onCorrectNetwork = networkID === metamaskNetworkID
          this.props.userInitialLoad(
            this.ethereumClient,
            this.defaultAccount,
            onCorrectNetwork
          )
          const ethWatcher = new EthWatcher(this.ethereumClient)
          ethWatcher.startWatching()
        }
      }
    }
    this.setState({ loading: false })
  }

  getMetamaskState = async () => {
    const { endpoint } = this.props.contracts
    const [approved, enabled, unlocked] = await Promise.all([
      metamaskIsApproved(),
      metamaskIsEnabled(),
      metamaskIsUnlocked(),
    ])
    const stillLoading = !(approved && enabled && unlocked && endpoint)
    this.setState({
      approved,
      enabled,
      unlocked,
      loading: stillLoading,
    })
    if (!stillLoading && this.looper) {
      // We have a MetaMask state we are happy with. Stop looping.
      clearInterval(this.looper)
    }
  }

  getNetworkId = web3Eth =>
    new Promise((resolve, reject) => {
      web3Eth.net.getId((err, networkID) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve(networkID)
        }
      })
    })

  connectWebsocket = () => {
    let contractState = this.props.contracts
    const provider = new Web3.providers.WebsocketProvider(
      contractState.endpoint
    )
    this.ethereumClient = new EthereumClient(provider, contractState)
    provider.connection.onopen = this.props.initializeState(
      this.ethereumClient,
      this.defaultAccount
    )
    provider.connection.onclose = this.connectWebsocket
  }

  render() {
    const { approved, enabled, loading, unlocked, web3Available } = this.state
    return (
      <EthContext.Provider
        value={{
          approved,
          enabled,
          loading,
          defaultAccount: this.defaultAccount,
          ethereumClient: this.ethereumClient,
          unlocked,
          web3Available,
        }}
      >
        {this.props.children}
      </EthContext.Provider>
    )
  }
}

export default connect(
  state => ({
    contracts: state.contracts,
  }),
  dispatch =>
    bindActionCreators(
      {
        loadContracts,
        resetPersistedState,
        setNetwork,
        userInitialLoad,
        initializeState,
      },
      dispatch
    )
)(EthProvider)
