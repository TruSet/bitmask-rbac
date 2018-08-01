pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";

contract BitmaskRBAC is RBAC {
  event DisplayChanged(address indexed addr, string display);

  string public constant ROLE_ADMIN = "admin";
  string public constant ROLE_PUBLISH = "publish";
  string public constant ROLE_VALIDATE = "validate";
  // all users in users must have a displayName set (checkUserExists modifier)
  mapping(address => string) displayNames;

  address[] public users;
  // If, in future, we need a way to delete users/displayNames then we'll need to do that carefully to ensure consistency with the user roles. E.g. we could also check for a user name before every call to checkRole, or we could iterate through all the roles to make sure none are assigned before deleting a user.

  // TODO adapt this contract to allow for dynamically addable roles
  string[3] public supportedRoles = [ROLE_ADMIN, ROLE_PUBLISH, ROLE_VALIDATE];

  constructor()
  public
  {
    addRole(msg.sender, ROLE_ADMIN);
  }
  
  modifier onlyAdmin()
  {
    checkRole(msg.sender, ROLE_ADMIN);
    _;
  }

  modifier checkUserExists(address user)
  {
    require((bytes)(displayNames[user]).length > 0);
    _;
  }

  function adminAddRole(address admin)
  onlyAdmin
  checkUserExists(admin)
  public {
    addRole(admin, ROLE_ADMIN);
  }

  function adminRemoveRole(address admin)
  onlyAdmin
  checkUserExists(admin)
  public {
    removeRole(admin, ROLE_ADMIN);
  }

  function publishAddRole(address publisher)
  onlyAdmin
  checkUserExists(publisher)
  public {
    addRole(publisher, ROLE_PUBLISH);
  }

  function publishRemoveRole(address publisher)
  onlyAdmin
  checkUserExists(publisher)
  public {
    removeRole(publisher, ROLE_PUBLISH);
  }

  function validateAddRole(address validator)
  onlyAdmin
  checkUserExists(validator)
  public {
    addRole(validator, ROLE_VALIDATE);
  }

  function validateRemoveRole(address validator)
  onlyAdmin
  checkUserExists(validator)
  public {
    removeRole(validator, ROLE_VALIDATE);
  }

  function newUser(address _addr, string _display, uint _roles) external
  onlyAdmin
  {
    require(_addr != address(0));
    require((bytes)(displayNames[_addr]).length == 0);
    require((bytes)(_display).length > 0);

    users.push(_addr);
    displayNames[_addr] = _display;
    emit DisplayChanged(_addr, _display);
    setUserRoles(_addr, _roles);
  }

  function getSupportedRolesCount() public constant returns(uint) {
    return supportedRoles.length;
  }

  function getUserCount() public constant returns(uint) {
    return users.length;
  }

  function getUserDisplay(address _addr) constant public returns (string) {
    return displayNames[_addr];
  }

  function getUserRoleBitmask(address _addr) constant public returns (uint) {
    uint numRoles = supportedRoles.length;
    uint roles = 0;

    for (uint i=0; i<numRoles; i++) {
      if (hasRole(_addr, supportedRoles[i])) {
        // TODO make use of bit shifting in constantinople
        roles = roles + 2**i;
      }
    }
    return roles;
  }

  function setUserRoles(address _addr, uint _newBitmask)
  onlyAdmin
  checkUserExists(_addr)
  public returns (uint) {
    uint numRoles = supportedRoles.length;
    uint currentBitmask = getUserRoleBitmask(_addr);
    uint differences = (currentBitmask ^ _newBitmask);

    for (uint i=0; i<numRoles; i++) {
      bool shouldUpdate = (differences & 2**i) > 0;
      bool shouldHaveRole = (_newBitmask & 2**i) > 0;
      if (shouldUpdate) {
        if (shouldHaveRole) {
          addRole(_addr, supportedRoles[i]);
        }
        if (!shouldHaveRole) {
          removeRole(_addr, supportedRoles[i]);
        }
      }
    }
    return _newBitmask;
  }

  function setUser(address _addr, string _display, uint _roles)
  onlyAdmin
  checkUserExists(_addr)
  public {
    setUserDisplay(_addr, _display);
    setUserRoles(_addr, _roles);
  }

  function setUserDisplay(address _addr, string _display) public
  onlyAdmin
  checkUserExists(_addr)
  {
    require((bytes)(_display).length > 0);
    displayNames[_addr] = _display;
    emit DisplayChanged(_addr, _display);
  }
}
