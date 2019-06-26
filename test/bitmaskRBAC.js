const utils = require('./utils.js')
const BigNumber = web3.utils.BN

/* eslint-disable */
let BitmaskRBAC = artifacts.require('./BitmaskRBAC.sol')

const GUEST = 0
const RBAC_ADMIN = 1 << 0
const PUBLISH = 1 << 1
const VALIDATE = 1 << 2
const MAX_UINT = new BigNumber(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
)

contract('BitmaskRBAC', function(accounts) {
  let rbac
  const [
    rbac_admin,
    publisher,
    validator,
    publisherValidator,
    consumer
  ] = accounts

  it('allows adding roles', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await rbac.addUserRole('role2')
    await rbac.addUserRole('role3')

    const supportedRolesCount = await rbac.getSupportedRolesCount()
    // 4 including obligatory rbac_admin role
    assert.equal(supportedRolesCount.toNumber(), 4, 'Add roles to rbac')
  })

  it('forbids deleting last admin', async function() {
    rbac = await BitmaskRBAC.new()
    await utils.assertRevert(rbac.revokeRole(rbac_admin, 'rbac_admin'))
  })

  it('forbids re-adding existing roles', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await utils.assertRevert(rbac.addUserRole('role1'))
    await utils.assertRevert(rbac.addUserRole('rbac_admin'))
  })

  it('forbids query of non-existent roles', async function() {
    await utils.assertRevert(rbac.hasRole(publisher, 'made_up_role'))
  })

  it('forbids setting roles using out-of-bounds bitmask', async function() {
    await utils.assertRevert(rbac.setUserRoles(publisher, 10))
  })

  it('allows granting and revoking roles', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await rbac.addUserRole('role2')

    let roleResult = await rbac.hasRole(rbac_admin, 'rbac_admin')
    assert.equal(roleResult, true, 'rbac_admin')
    roleResult = await rbac.hasRole(rbac_admin, 'role1')
    assert.equal(roleResult, false, 'role1')
    roleResult = await rbac.hasRole(rbac_admin, 'role2')
    assert.equal(roleResult, false, 'role2')

    await rbac.grantRole(rbac_admin, 'role1')
    await rbac.grantRole(rbac_admin, 'role2')

    roleResult = await rbac.hasRole(rbac_admin, 'rbac_admin')
    assert.equal(roleResult, true, 'rbac_admin')
    roleResult = await rbac.hasRole(rbac_admin, 'role1')
    assert.equal(roleResult, true, 'role1')
    roleResult = await rbac.hasRole(rbac_admin, 'role2')
    assert.equal(roleResult, true, 'role2')

    await rbac.revokeRole(rbac_admin, 'role1')

    roleResult = await rbac.hasRole(rbac_admin, 'rbac_admin')
    assert.equal(roleResult, true, 'rbac_admin')
    roleResult = await rbac.hasRole(rbac_admin, 'role1')
    assert.equal(roleResult, false, 'role1')
    roleResult = await rbac.hasRole(rbac_admin, 'role2')
    assert.equal(roleResult, true, 'role2')
  })

  it('tracks user counts for each role', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await rbac.addUserRole('role2')

    let count = await rbac.getUserCountByRole('rbac_admin')
    assert.equal(count.toNumber(), 1, 'rbac_admin')

    count = await rbac.getUserCountByRole('role1')
    assert.equal(count.toNumber(), 0, 'role1')

    await rbac.grantRole(rbac_admin, 'role1')
    await rbac.grantRole(rbac_admin, 'role2')

    count = await rbac.getUserCountByRole('rbac_admin')
    assert.equal(count.toNumber(), 1, 'rbac_admin')

    count = await rbac.getUserCountByRole('role1')
    assert.equal(count.toNumber(), 1, 'role1')

    count = await rbac.getUserCountByRole('role2')
    assert.equal(count.toNumber(), 1, 'role2')

    await rbac.revokeRole(rbac_admin, 'role1')

    count = await rbac.getUserCountByRole('rbac_admin')
    assert.equal(count.toNumber(), 1, 'rbac_admin')

    count = await rbac.getUserCountByRole('role1')
    assert.equal(count.toNumber(), 0, 'role1')

    count = await rbac.getUserCountByRole('role2')
    assert.equal(count.toNumber(), 1, 'role2')
  })

  it('allows setting multiple user roles using bitmask', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await rbac.setUserRoles(rbac_admin, 3) // Both roles

    let roleResult = await rbac.hasRole(rbac_admin, 'rbac_admin')
    assert.equal(roleResult, true, 'is rbac_admin')
    roleResult = await rbac.hasRole(rbac_admin, 'role1')
    assert.equal(roleResult, true, 'is role1')
  })

  it('tracks user counts for each role (bitmask)', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')

    let count = await rbac.getUserCount()
    assert.equal(count.toNumber(), 1, 'overall')

    count = await rbac.getUserCountByRole('rbac_admin')
    assert.equal(count.toNumber(), 1, 'rbac_admin')

    count = await rbac.getUserCountByRole('role1')
    assert.equal(count.toNumber(), 0, 'role1')

    let userList = await rbac.getUsers()
    assert.deepEqual(userList, [rbac_admin])

    await rbac.setUserRoles(rbac_admin, 3) // Both roles
    await rbac.newUser(publisher, 'TestPublisher1', 3) // Both roles

    userList = await rbac.getUsers()
    assert.deepEqual(userList, [rbac_admin, publisher])

    count = await rbac.getUserCountByRole('rbac_admin')
    assert.equal(count.toNumber(), 2, 'rbac_admin')

    count = await rbac.getUserCountByRole('role1')
    assert.equal(count.toNumber(), 2, 'role1')

    count = await rbac.getUserCount()
    assert.equal(count.toNumber(), 2, 'overall')
  })

  it('forbids deleting last admin (bitmask)', async function() {
    rbac = await BitmaskRBAC.new()
    await rbac.addUserRole('role1')
    await rbac.setUserRoles(rbac_admin, 3) // Both roles
    await utils.assertRevert(rbac.setUserRoles(rbac_admin, 2)) // Not the admin role
  })

  describe('when {admin_rbac,publish,validate} roles exist', function() {
    beforeEach(async function() {
      rbac = await BitmaskRBAC.new()
      await rbac.addUserRole('publish')
      await rbac.addUserRole('validate')
      await rbac.setUser(
        rbac_admin,
        'Contract Creator Updated Name',
        RBAC_ADMIN | PUBLISH | VALIDATE
      )

      await rbac.newUser(publisher, 'TestPublisher1', PUBLISH)
      await rbac.newUser(validator, 'TestValidator1', VALIDATE)
      await rbac.newUser(
        publisherValidator,
        'TestPublisherValidator1',
        PUBLISH | VALIDATE
      )
    })

    it('allows adding more roles', async function() {
      let supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(
        supportedRolesCount.toNumber(),
        3,
        'Adding more roles to rbac'
      )

      await rbac.addUserRole('role1')
      await rbac.addUserRole('role2')
      await rbac.addUserRole('role3')

      supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(
        supportedRolesCount.toNumber(),
        6,
        'Added more roles to rbac'
      )
    })

    it('ensures only admins have rbac_admin role', async function() {
      // tests publisher
      let publisherResult = await rbac.hasRole(publisher, 'rbac_admin')
      assert.equal(publisherResult, false, 'publishers cant rbac_admin')

      // tests validator
      let validatorResult = await rbac.hasRole(validator, 'rbac_admin')
      assert.equal(validatorResult, false, 'validators cant rbac_admin')

      // tests validator
      let publisherValidatorResult = await rbac.hasRole(
        publisherValidator,
        'rbac_admin'
      )
      assert.equal(
        publisherValidatorResult,
        false,
        'publisherValidators cant rbac_admin'
      )

      // tests consumer
      let consumerResult = await rbac.hasRole(consumer, 'rbac_admin')
      assert.equal(consumerResult, false, 'consumers cant rbac_admin')

      // tests rbac_admin user
      let adminResult = await rbac.hasRole(rbac_admin, 'rbac_admin')
      assert.equal(
        adminResult,
        true,
        'canAdmin should return true for rbac_admin'
      )
    })

    it('checks that roles can be set correctly in aggregate', async function() {
      // tests publisher
      let publisherResult = await rbac.hasRole(publisher, 'publish')
      assert.equal(
        publisherResult,
        true,
        'hasRole should return true for publishers'
      )

      // tests validator
      let validatorResult = await rbac.hasRole(validator, 'publish')
      assert.equal(validatorResult, false, 'validators cannot publish')

      // tests consumer
      let consumerResult = await rbac.hasRole(consumer, 'publish')
      assert.equal(consumerResult, false, 'consumers cannot publish')

      // tests rbac_admin user
      await rbac.setUserRoles(rbac_admin, RBAC_ADMIN | PUBLISH)
      let adminResult = await rbac.hasRole(rbac_admin, 'publish')
      assert.equal(adminResult, true, 'admins should be able to publish')
    })

    it('checks that roles can be granted and revoked', async function() {
      await rbac.grantRole(publisher, 'validate')
      let result = await rbac.hasRole(publisher, 'validate')
      assert.equal(result, true, 'the role was not granted')

      await rbac.revokeRole(publisher, 'validate')
      result = await rbac.hasRole(publisher, 'validate')
      assert.equal(result, false, 'the role was not revoked')
    })

    it('checks validate roles for various user accounts', async function() {
      // tests publisher
      let publisherResult = await rbac.hasRole(publisher, 'validate')
      assert.equal(
        publisherResult,
        false,
        'publisher shouldnt be able to validate by default'
      )

      // tests validator
      let validatorResult = await rbac.hasRole(validator, 'validate')
      assert.equal(
        validatorResult,
        true,
        'validator should be able to validate'
      )

      // tests publisher
      let publisherValidatorResult = await rbac.hasRole(
        publisherValidator,
        'validate'
      )
      assert.equal(
        publisherValidatorResult,
        true,
        'publisherValidator should be able to validate'
      )

      // tests consumer
      let consumerResult = await rbac.hasRole(consumer, 'validate')
      assert.equal(
        consumerResult,
        false,
        'consumer shouldnt be able to validate'
      )

      // tests rbac_admin user
      await rbac.setUserRoles(rbac_admin, RBAC_ADMIN | PUBLISH | VALIDATE)
      let adminResult = await rbac.hasRole(rbac_admin, 'validate')
      assert.equal(adminResult, true, 'rbac_admin should be able to validate')
    })

    it('checks updating a node', async function() {
      let changeableUser = accounts[5]
      await rbac.newUser(changeableUser, 'TestNode1', VALIDATE)
      await rbac.setUserDisplay(changeableUser, 'TestNode2')
      await rbac.setUserRoles(validator, VALIDATE)
      await rbac.setUserRoles(changeableUser, VALIDATE)

      let roleResult = await rbac.hasRole(changeableUser, 'validate')
      assert.equal(roleResult, true, "Node role wasn't set correctly")

      let displayResult = await rbac.getUserDisplay(changeableUser)
      assert.equal(
        displayResult,
        'TestNode2',
        "Node display wasn't set correctly"
      )
    })

    it('checks setting user roles en masse', async function() {
      let changeableUser = accounts[6]
      await rbac.newUser(changeableUser, 'TestNode1', VALIDATE)

      let newRoles = 3 //(RBAC_ADMIN | PUBLISH)
      await rbac.setUserRoles(changeableUser, 3)

      let roleResult = await rbac.hasRole(changeableUser, 'validate')
      assert.equal(roleResult, false, 'can no longer validate')

      roleResult = await rbac.hasRole(changeableUser, 'rbac_admin')
      assert.equal(roleResult, true, 'can rbac_admin')

      roleResult = await rbac.hasRole(changeableUser, 'publish')
      assert.equal(roleResult, true, 'can publish')
    })

    it('forbids setting roles using out-of-bounds bitmask', async function() {
      await utils.assertRevert(
        rbac.setUserRoles(publisher, 1 + Math.pow(2, 10))
      )
      // await utils.assertRevert(rbac.setUserRoles(publisher, 8))
    })

    it('allows setting user details all at once', async function() {
      let changeableUser = accounts[7]
      await rbac.newUser(changeableUser, 'TestUser7', VALIDATE)

      let newRoles = 3 //(RBAC_ADMIN | PUBLISH)
      await rbac.setUser(changeableUser, 'NewName', 3)

      let roleResult = await rbac.hasRole(changeableUser, 'validate')
      assert.equal(roleResult, false, 'can no longer validate')

      roleResult = await rbac.hasRole(changeableUser, 'rbac_admin')
      assert.equal(roleResult, true, 'can rbac_admin')

      roleResult = await rbac.hasRole(changeableUser, 'publish')
      assert.equal(roleResult, true, 'can publish')

      let displayResult = await rbac.getUserDisplay(changeableUser)
      assert.equal(
        displayResult,
        'NewName',
        "User display wasn't set correctly"
      )
    })

    it('allows empty display names', async function() {
      let namelessUser = accounts[8]
      await rbac.newUser(namelessUser, '', VALIDATE)
      let name = await rbac.getUserDisplay(namelessUser)
      assert.equal(name, '', 'Empty display name (creation)')

      await rbac.setUserDisplay(namelessUser, 'NonEmpty')
      name = await rbac.getUserDisplay(namelessUser)
      assert.equal(name, 'NonEmpty', 'Non-Empty display name')

      await rbac.setUserDisplay(namelessUser, '')
      name = await rbac.getUserDisplay(namelessUser)
      assert.equal(name, '', 'Empty display name (setter)')
    })
  })

  describe('when many roles exist', function() {
    let startingRoleCount = 255
    let manyRoledUser = accounts[7]
    let manyRoledUserRoleBitmask =
      Math.pow(2, 1) + Math.pow(2, 2) + Math.pow(2, 30) // (foo1 | foo2 | foo30)

    before(async function() {
      rbac = await BitmaskRBAC.new()

      // Add our roles. Do this one at a time so that ordering/bitmasks are deterministic
      let newRoleCount = startingRoleCount - 1 // Built-in rbac_admin role
      for (let i = 1; i <= newRoleCount; i++) {
        await rbac.addUserRole('foo' + i)
      }
    })

    it('allows adding up to 256 roles and no more', async function() {
      let supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(
        supportedRolesCount.toNumber(),
        startingRoleCount,
        'Added roles'
      )

      await rbac.addUserRole('foo255')

      supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(
        supportedRolesCount.toNumber(),
        startingRoleCount + 1,
        'Add roles to rbac'
      )

      supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(supportedRolesCount, 256, '256 roles in rbac')

      await utils.assertRevert(rbac.addUserRole('flibble'))
    })
  })

  describe('when 256 roles exist', function() {
    let startingRoleCount = 256
    let manyRoledUser = accounts[8]
    let manyRoledUserRoleBitmask =
      Math.pow(2, 1) + Math.pow(2, 2) + Math.pow(2, 30) // (foo1 | foo2 | foo30)

    before(async function() {
      rbac = await BitmaskRBAC.new()

      // Add our roles. Do this one at a time so that ordering/bitmasks are deterministic
      let newRoleCount = startingRoleCount - 1 // Built-in rbac_admin role
      for (let i = 1; i <= newRoleCount; i++) {
        await rbac.addUserRole('foo' + i)
      }
    })

    it('checks setting user roles en masse', async function() {
      await rbac.newUser(manyRoledUser, 'Test Many Roled User', 1) // Starts as RBAC_ADMIN

      await rbac.setUserRoles(manyRoledUser, manyRoledUserRoleBitmask)

      let roleResult = await rbac.hasRole(manyRoledUser, 'rbac_admin')
      assert.equal(roleResult, false, 'no longer an rbac_admin')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo1')
      assert.equal(roleResult, true, 'is foo1')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo2')
      assert.equal(roleResult, true, 'is foo2')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo3')
      assert.equal(roleResult, false, 'is not foo3')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo4')
      assert.equal(roleResult, false, 'is not foo4')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo29')
      assert.equal(roleResult, false, 'is not foo29')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo30')
      assert.equal(roleResult, true, 'is foo30')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo31')
      assert.equal(roleResult, false, 'is not foo31')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo255')
      assert.equal(roleResult, false, 'is not foo255')
    })

    it('preserves small bitmask value', async function() {
      let returnedBitmask = await rbac.getUserRoleBitmask.call(manyRoledUser)
      assert.equal(
        returnedBitmask,
        manyRoledUserRoleBitmask,
        'bitmask preserved'
      )

      // We also send the transaction so that we measure and report gas usage
      await rbac.getUserRoleBitmask(manyRoledUser)
    })

    // The following two tests use a lot of gas. We can configure a high gas limit locally, but
    // until we do that properly in Circle CI (I have tried and failed) we'll skip this test during CI
    it.skip('allows setting max bitmask value', async function() {
      let supportedRolesCount = await rbac.getSupportedRolesCount()
      assert.equal(supportedRolesCount, 256, '256 roles in rbac')

      await rbac.setUserRoles(manyRoledUser, MAX_UINT)

      roleResult = await rbac.hasRole(manyRoledUser, 'foo1')
      assert.equal(roleResult, true, 'is foo1')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo2')
      assert.equal(roleResult, true, 'is foo2')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo3')
      assert.equal(roleResult, true, 'is foo3')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo4')
      assert.equal(roleResult, true, 'is foo4')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo29')
      assert.equal(roleResult, true, 'is foo29')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo30')
      assert.equal(roleResult, true, 'is foo30')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo31')
      assert.equal(roleResult, true, 'is foo31')

      roleResult = await rbac.hasRole(manyRoledUser, 'foo255')
      assert.equal(roleResult, true, 'is foo255')
    })

    it.skip('preserves large bitmask value', async function() {
      let returnedBitmask = await rbac.getUserRoleBitmask.call(manyRoledUser)

      assert.equal(
        returnedBitmask.valueOf(),
        MAX_UINT.valueOf(),
        'bitmask preserved (string)'
      )

      // We also send the transaction so that we measure and report gas usage
      await rbac.getUserRoleBitmask(manyRoledUser)
    })
  })
})
