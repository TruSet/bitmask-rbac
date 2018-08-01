const BitmaskRBAC = artifacts.require('./BitmaskRBAC.sol')

module.exports = (deployer, network, accounts) => {
  deployer.deploy(BitmaskRBAC)
}
