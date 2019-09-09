# bitmask-rbac

RBAC stands for Role Based Access Control. This solidity contract can be used to control access to Ethereum smart contracts and their functions, by assigning roles to users and having functions require certain roles.

This means you can limit which users (or contracts) are able to call contract functions and easily manage the provisioning ond deprovisioning of these roles.  This was designed for the TruSet dApp, wherin users can be given roles like the ability to create new data records, publish data, validate data, and perform admin functions.

## Use - react app interface
The easiest way to interact with the RBAC is via our react app interface.
Take a look at [our react app interface](https://truset.github.io/bitmask-rbac/portal/)

## Use - smart contract interface

### Managing the available roles
This implementation provides only one role to start with: `rbac_admin`, which is given to the user who deploys the contract. Other roles can be added up to a maximum of 256 by calling `addUserRole()` as the `rbac_admin`. Once added, roles can never be removed.

### Granting and revoking roles for users
An `rbac_admin` can grant roles or revoke roles for individual users using `grantRole()` and `revokeRole()`. Or multiple role changes can be applied atomically using bitmasks (`getUserRoleBitmask()`, `setUserRoles()`).

### How roles are stored in bitmasks
The bitmask-rbac uses a bitmask to store up to 256 roles per user compactly in field that is a glorified `uint256`.  For example, an application like the TruSet dApp might contain three roles: `rbac_admin`, `publish`, `validate` (in that order) then:

- users with a role bitmask of `101 (5)` would be able to admin and validate, but not publish
- users with a role bitmask of `011 (3)` would be able to publish and validate, but not admin
- users with a role bitmask of `001 (1)` are only able to validate

### Your own RBAC

You may use the bitmask-rbac as is, or create solidity contracts that inherit this base contract to extend it with additional functionality and/or restrictions.

### The power of the 'rbac_admin' role

An `rbac_admin` has extraordinary powers to administer a system's users - kinda like a root unix superuser.  Any user with the `rbac_admin` role must be _trusted_ by the system. They have the ability to arbitrarily change user roles, including their own, but they also have the ability to compromise the RBAC itself in multiple and not always obvious ways:

 - they could remove the permissions of all other rbac_admins, leaving themselves in sole control of the contract
 - they could add roles until there are 256 roles, at which point no more roles can ever be added (nor deleted) and any code that tries to add roles will fail
 - they could add roles that have names that _look_ the same as existing role names, but which use different unicode characters. This approach would result in seemingly-identical roles with very different properties, and could be used to trick smart contract users or auditors into thinking the system does something it does not.
 
 It may be useful to have an rbac admin set up the roles of a system, grant the appropriate roles to smart contracts that need them, and then deprovision their own rbac admin permission so that users do not need to trust a human with this role.  This would require tweaking the rbac to remove the existing check that at least one admin exists.

## Usage

You can check a user's permission in the RBAC with function modifiers.  Many of the contracts in our application derive from a `BitmaskRBACPermissionable` to easily share these function modifiers.

```solidity
contract BitmaskRBACPermissionable {
  string public constant ROLE_RBAC_ADMIN = "rbac_admin";

  modifier onlyAdmin() {
    require(rbac.hasRole(msg.sender, ROLE_RBAC_ADMIN));
    _;
  }
}

contract MyContract is BitmaskRBACPermissionable{
  constructor(address _rbac) public {
    rbac = BitmaskRBAC(_rbac);
  }

  function manageAppFunction() external
  onlyAdmin()
  {
  // something only admin can do
  }
}
```

To create a new user, just specify the address, name (optional), and bitmask of the required roles:

```javascript
await rbac.newUser(user_address, 'Contract Creator', ADMIN | PUBLISH | VALIDATE)
```

## Usage (Javascript)

Once you have imported your user roles into javascript (e.g. using drizzle), it is super easy to define appropriate constants.  For example
```javascript
const ADMIN = 1 << 0;
const PUBLISH = 1 << 1;
const VALIDATE = 1 << 2;
```
and then check whether a user bitmask allows a given role or roles.
```javascript
const user = { displayName: 'Greg', role: (PUBLISH | ADMIN) } // user has publish and admin roles
const canPublish = (user.role & PUBLISH) !== 0 // true
const canAdminOrValidate = (user.role & (VALIDATE | ADMIN)) !== 0 // true
```

## About
bitmask-rbac was created by @gtaschuk and @nmclrn for use in the [TruSet](TruSet.com) app, a [Consensys](Consensys.net) spoke.
