# bitmask-rbac

RBAC stands for Role Based Access Control. This solidity contract can be used to control access to Ethereum smart contracts and their functions, by assigning roles to users and having functions require certain roles.

This is a work in progress, built for and used by the TruSet dApp.

This implementation provides only one role to start with: `rbac_admin`. Other roles can be added up to a maximum of 256 by calling `addUserRole()`. Once added, roles can never be removed.

A user can be granted roles or have them revoked individually using `grantRole()` and `revokeRole()`. Or multiple role changes can be applied atomically using bitmasks (`getUserRoleBitmask()`, `setUserRoles()`). For example if there are three roles: `rbac_admin`, `publish`, `validate` (in that order) then:

- users with a role bitmask of `101 (5)` would be able to admin and validate, but not publish
- users with a role bitmask of `011 (3)` would be able to publish and validate, but not admin
- users with a role bitmask of `001 (1)` are only able to validate

It is anticipated that solidity contracts will inherit this base contract to extend it with additional functionality and/or restrictions.

## The power of the 'rbac_admin' role

Any user with the 'rbac_admin' role must be _trusted_ by the system. They have the ability to arbitrarily change user roles, including their own, but they also have the ability to compromise the RBAC itself in multiple and not always obvious ways:

 - they could remove the permissions of all other rbac_admins, leaving themselves in sole control of the contract
 - they could add roles until there are 256 roles, at which point no more roles can ever be added (nor deleted) and any code that tries to add roles will fail
 - they could add roles that have names that _look_ the same as existing role names, but which use different unicode characters. This approach would result in seemingly-identical roles with very different properties, and could be used to trick smart contract users or auditors into thinking the system does something it does not.

## Usage

You can check a user's permission in the RBAC with function modifiers.

```
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

```
await rbac.newUser(user_address, 'Contract Creator', ADMIN | PUBLISH | VALIDATE)
```

## Usage (Javascript)

Once you have imported your user roles into javascript (e.g. using drizzle), it is super easy to define appropriate constants (e.g. `ADMIN = 1; PUBLISH = 2; VALIDATE = 4`) and then check whether a user bitmask allows a given role or roles. E.g. `(user.role & PUBLISH) !== 0` to check if a user can publish, or even `(user.role & (VALIDATE | ADMIN)) !== 0` to check if a user can Validate or Admin.
