let compilers = {
  solc: {
    version: '0.4.25',
    docker: false,
  },
}

module.exports = {
  compilers,
  networks: {
    test: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    ganache: {
      host: 'localhost',
      port: 7545,
      gas: 6700000,
      gasPrice: 10000000,
      network_id: '*', // eslint-disable-line camelcase
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 10,
    },
  },
}
