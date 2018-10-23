# bitmask-rbac

RBAC stands for Role Based Access Control. This solidity contract can be used to control access to Ethereum smart contracts and their functions, by assigning roles to users and having functions require certain roles.

This is a work in progress, built for and used by the TruSet dApp.

This implementation provides only one role to start with: `rbac_admin`. Other roles can be added up to a maximum of 256 by calling `addUserRole()`. Once added, roles can never be removed.

A user can be granted roles or have them revoked individually using `grantRole()` and `revokeRole()`. Or multiple role changes can be applied atomically using bitmasks (`getUserRoleBitmask()`, `setUserRoles()`). For example if there are three roles: `rbac_admin`, `publish`, `validate` (in that order) then:

- users with a role bitmask of `101 (5)` would be able to admin and validate, but not publish
- users with a role bitmask of `011 (3)` would be able to publish and validate, but not admin
- users with a role bitmask of `001 (1)` are only able to validate

It is anticipated that solidity contracts will inherit this bas contract to extend it with additional functionality and/or restrictions.

## Usage

You can check a user's permission in the RBAC with function modifiers.

```
contract BitmaskRBACPermissionable {
  string public constant ROLE_ADMIN = "rbac_admin";

  modifier onlyAdmin() {
    require(rbac.hasRole(msg.sender, ROLE_ADMIN));
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

To create a new user, just specify the name (required) and bitmask of suitable roles:

```
await rbac.newUser(admin, 'Contract Creator', ADMIN | PUBLISH | VALIDATE)
```

## Usage (Javascript)

Once you have imported your user roles into javascript (e.g. using drizzle), it is super easy to define appropriate constants (e.g. `ADMIN = 1; PUBLISH = 2; VALIDATE = 4`) and then check whether a user bitmask allows a given role or roles. E.g. `(user.role & PUBLISH) !== 0` to check if a user can publish, or even `(user.role & (VALIDATE | ADMIN)) !== 0` to check if a user can Validate or Admin.

## TODO

- Ensure we cannot accidentally delete the last user with an `rbac_admin` role, or else the RBAC becomes fixed forever.
- Consider replacing openzeppelin rbac dependency with logic that uses bitmasks natively
  Prevent duplicate roles
