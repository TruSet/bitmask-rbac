/* eslint-disable */
let BitmaskRBAC = artifacts.require('./BitmaskRBAC.sol')

const GUEST = 0
const ADMIN = 1 << 0
const PUBLISH = 1 << 1
const VALIDATE = 1 << 2


contract('BitmaskRBAC', function (accounts) {
  let rbac
  let admin
  let publisher
  let validator
  let publisherValidator
  let consumer

  before(async function () {
    rbac = await BitmaskRBAC.deployed()
    admin = accounts[0]
    await rbac.newUser(admin, 'Contract Creator', ADMIN | PUBLISH | VALIDATE)
    await rbac.addUserRole("publish")
    await rbac.addUserRole("validate")

    publisher = accounts[1]
    await rbac.newUser(publisher, 'TestPublisher1', PUBLISH)

    validator = accounts[2]
    await rbac.newUser(validator, 'TestValidator1', VALIDATE)

    publisherValidator = accounts[3]
    await rbac.newUser(publisherValidator, 'TestPublisherValidator1', PUBLISH | VALIDATE)

    consumer = accounts[4]
  })

  it('allows you to add roles', async function () {
    let newRBAC = await BitmaskRBAC.new()
    await newRBAC.addUserRole('role1')
    await newRBAC.addUserRole('role2')
    await newRBAC.addUserRole('role3')

    const supportedRolesCount = await newRBAC.getSupportedRolesCount()

    // 4 including obligatory admin role
    assert.equal(supportedRolesCount.toNumber(), 4, 'Add roles to rbac')
  })

  it('ensures only admins have admin role', async function () {
    // tests publisher
    let publisherResult = await rbac.hasRole(publisher, "admin")
    assert.equal(publisherResult, false, 'publishers cant admin')

    // tests validator
    let validatorResult = await rbac.hasRole(validator, "admin")
    assert.equal(validatorResult, false, 'validators cant admin')

    // tests validator
    let publisherValidatorResult = await rbac.hasRole(publisherValidator, "admin")
    assert.equal(publisherValidatorResult, false, 'publisherValidators cant admin')

    // tests consumer
    let consumerResult = await rbac.hasRole(consumer, "admin")
    assert.equal(consumerResult, false, 'consumers cant admin')

    // tests admin user
    let adminResult = await rbac.hasRole(admin, "admin")
    assert.equal(adminResult, true, 'canAdmin should return true for admin')
  })

  it('checks that roles can be set correctly in aggregate', async function () {
    // tests publisher
    let publisherResult = await rbac.hasRole(publisher, "publish")
    assert.equal(publisherResult, true, 'hasRole should return true for publishers')

    // tests validator
    let validatorResult = await rbac.hasRole(validator, "publish")
    assert.equal(validatorResult, false, 'validators cannot publish')

    // tests consumer
    let consumerResult = await rbac.hasRole(consumer, "publish")
    assert.equal(consumerResult, false, 'consumers cannot publish')

    // tests admin user
    await rbac.setUserRoles(admin, ADMIN | PUBLISH)
    let adminResult = await rbac.hasRole(admin, "publish")
    assert.equal(adminResult, true, 'admins should be able to publish')
  })

  it('checks that roles can be granted and revoked', async function () {
    await rbac.grantRole(publisher, "validate")
    let result = await rbac.hasRole(publisher, "validate")
    assert.equal(result, true, 'the role was not granted')

    await rbac.revokeRole(publisher, "validate")
    result = await rbac.hasRole(publisher, "validate")
    assert.equal(result, false, 'the role was not revoked')
  })

  it('checks validate roles for various user accounts', async function () {
    // tests publisher
    let publisherResult = await rbac.hasRole(publisher, "validate")
    assert.equal(publisherResult, false, 'publisher shouldnt be able to validate by default')

    // tests validator
    let validatorResult = await rbac.hasRole(validator, "validate")
    assert.equal(validatorResult, true, 'validator should be able to validate')

    // tests publisher
    let publisherValidatorResult = await rbac.hasRole(publisherValidator, "validate")
    assert.equal(publisherValidatorResult, true, 'publisherValidator should be able to validate')

    // tests consumer
    let consumerResult = await rbac.hasRole(consumer, "validate")
    assert.equal(consumerResult, false, 'consumer shouldnt be able to validate')

    // tests admin user
    await rbac.setUserRoles(admin, ADMIN | PUBLISH | VALIDATE)
    let adminResult = await rbac.hasRole(admin, "validate")
    assert.equal(adminResult, true, 'admin should be able to validate')
  })

  it('checks updating a node', async function () {
    let changeableUser = accounts[5]
    await rbac.newUser(changeableUser, 'TestNode1', VALIDATE)
    await rbac.setUserDisplay(changeableUser, 'TestNode2')
    await rbac.setUserRoles(validator, VALIDATE)
    await rbac.setUserRoles(changeableUser, VALIDATE)

    let roleResult = await rbac.hasRole(changeableUser, "validate")
    assert.equal(roleResult, true, 'Node role wasn\'t set correctly')

    let displayResult = await rbac.getUserDisplay(changeableUser)
    assert.equal(displayResult, 'TestNode2', 'Node display wasn\'t set correctly')
  })

  it('checks setting user roles en masse', async function () {
    let changeableUser = accounts[6]
    await rbac.newUser(changeableUser, 'TestNode1', VALIDATE)

    let newRoles = 3//(ADMIN | PUBLISH)
    await rbac.setUserRoles(changeableUser, 3)

    let roleResult = await rbac.hasRole(changeableUser, 'validate')
    assert.equal(roleResult, false, 'can no longer validate')

    roleResult = await rbac.hasRole(changeableUser, 'admin')
    assert.equal(roleResult, true, 'can admin')

    roleResult = await rbac.hasRole(changeableUser, 'publish')
    assert.equal(roleResult, true, 'can publish')
  })

  it('allows you to set user details all at once', async function () {
    let changeableUser = accounts[7]
    await rbac.newUser(changeableUser, 'TestUser7', VALIDATE)

    let newRoles = 3//(ADMIN | PUBLISH)
    await rbac.setUser(changeableUser, "NewName", 3)

    let roleResult = await rbac.hasRole(changeableUser, 'validate')
    assert.equal(roleResult, false, 'can no longer validate')

    roleResult = await rbac.hasRole(changeableUser, 'admin')
    assert.equal(roleResult, true, 'can admin')

    roleResult = await rbac.hasRole(changeableUser, 'publish')
    assert.equal(roleResult, true, 'can publish')

    let displayResult = await rbac.getUserDisplay(changeableUser)
    assert.equal(displayResult, 'NewName', 'User display wasn\'t set correctly')
  })
})
