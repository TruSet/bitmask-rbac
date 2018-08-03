# bitmask-rbac

A RBAC is a Role Based Access Control.  It controls access to functions by assigning role permissions to users - in this case to ethereum addresses - users or contracts

This is a work in progress, adapted from the TruSet dApp.

the user roles are stored as bitmasks.  For example - three roles, admin, publish, validate

`101 (5)` would be able to admin and validate

`011 (3)` would be able to publish and validate

`001 (1)` is only able to validate

This makes it super easy to check if a user bitmask allows a role. ie `(user.role & PUBLISH) !== 0` or even `(user.role & (VALIDATE | ADMIN)) !== 0` to check if a user can Validate or ADMIN

## Usage

You can check a user's permission in the RBAC with function modifiers.
```
contract BitmaskRBACPermissionable {
  string public constant ROLE_ADMIN = "admin";

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

## TODO

Scope what roles a user can add/remove to their role(s)
Investigate gas use when there are many (> 100) roles, and consider replacing openzeppelin rbac dependency with logic that uses bitmasks natively
Prevent duplicate roles
