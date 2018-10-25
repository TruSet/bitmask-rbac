pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";

/**
* @title Role-Based Access Control (RBAC) supporting bitmasks, for getting/setting multiple roles atomically
* @author TruSet
* @dev Enhance openzeppelin's RBAC to allow getting and setting of multiple roles in a single
*      transaction, to maintain lists/counts of users and roles, and to store an optional display name
*      for each user.
*
*      A maximum of 256 roles are supported, and roles cannot be removed once added.
* 
*      Only supported roles can be queried, because this makes us "fail fast" if we make typos and it
*      helps us to alleviate concerns around "look-a-like" strings. (See
*      https://github.com/OpenZeppelin/openzeppelin-solidity/issues/1090)
*/
contract BitmaskRBAC is RBAC {
  event DisplayChanged(address indexed addr, string display);
  // TODO: event for "new supported role"

  struct User {
    bool exists;
    string displayName;
  }

  // This role is special. It is used to administer the RBAC itself. There is always at least one user with this role.
  string public constant ROLE_RBAC_ADMIN = "rbac_admin";

  // Users cannot be deleted, but their roles can be revoked. If/when we need a way to delete users,
  // we'll need to do that carefully to ensure consistency with the user roles. E.g. we could also
  // check for user existence before every call to checkRole, or we could iterate through all the roles
  // to make sure none are assigned before deleting a user.
  mapping(address => User) users;
  address[] public userList;

  mapping(string => bool) supportedRoles;
  string[] public supportedRoleList;

  mapping(string => uint) userCountsByRole;

  constructor()
  public
  {
    supportedRoles[ROLE_RBAC_ADMIN] = true;
    supportedRoleList.push(ROLE_RBAC_ADMIN);
    userList.push(msg.sender);
    User memory u =  User(true, "Contract creator");
    users[msg.sender] = u;
    userCountsByRole[ROLE_RBAC_ADMIN]++;
    addRole(msg.sender, ROLE_RBAC_ADMIN);
  }
  
  modifier onlyRbacAdmin()
  {
    checkRole(msg.sender, ROLE_RBAC_ADMIN);
    _;
  }

  modifier doesNotDeleteLastAdmin()
  {
    _;
    require(userCountsByRole[ROLE_RBAC_ADMIN] > 0);
  }

  modifier checkUserExists(address user)
  {
    require(userExists(user));
    _;
  }

  function userExists(address user) view public returns (bool) {
    return users[user].exists;
  }

  modifier checkRoleExists(string role)
  {
    require(roleExists(role));
    _;
  }

  function roleExists(string role) view public returns (bool) {
    return supportedRoles[role];
  }

  function getUserCountByRole(string _role) view public returns (uint) {
    return userCountsByRole[_role];
  }

  function addUserRole(string _role)
  onlyRbacAdmin
  external {
    require(supportedRoleList.length < 256); // because we use a uint256 as a bitmask
    require((bytes)(_role).length > 0);
    require(!roleExists(_role));
    supportedRoles[_role] = true;
    supportedRoleList.push(_role);
  }

  function _grantRoleIfNotGrantedNoChecks(address user, string roleName)
  internal {
    if (!hasRole(user, roleName)) {
      userCountsByRole[roleName]++;
      addRole(user, roleName);
    }
  }

  function grantRole(address user, string roleName)
  onlyRbacAdmin
  checkUserExists(user)
  checkRoleExists(roleName)
  public {
    _grantRoleIfNotGrantedNoChecks(user, roleName);
  }

  // We override the default hasRole implementation to insist that the role is one we know about. This
  // causes us to fail fast if we make typos, and also alleviates some of the concerns around "look-a-like"
  // strings. (See https://github.com/OpenZeppelin/openzeppelin-solidity/issues/1090)
  /**
   * @dev determine if addr has role
   * @param _operator address
   * @param _role the name of the role
   * @return bool
   */
  function hasRole(address _operator, string _role)
    view
    public
    checkRoleExists(_role)
    returns (bool)
  {
    return super.hasRole(_operator, _role);
  }

  function _revokeRoleIfGrantedNoChecks(address user, string roleName)
  internal {
    if (hasRole(user, roleName)) {
      userCountsByRole[roleName]--;
      removeRole(user, roleName);
    }
  }

  function revokeRole(address user, string roleName)
  onlyRbacAdmin
  doesNotDeleteLastAdmin
  checkUserExists(user)
  checkRoleExists(roleName)
  public {
    _revokeRoleIfGrantedNoChecks(user, roleName);
  }

  function newUser(address _addr, string _display, uint _roles) external
  onlyRbacAdmin
  {
    require(_addr != address(0));
    require(!userExists(_addr));

    userList.push(_addr);
    User memory u;
    u.exists = true;
    u.displayName = _display;
    users[_addr] = u;
    emit DisplayChanged(_addr, _display);
    setUserRoles(_addr, _roles);
  }

  function getSupportedRolesCount() public view returns(uint) {
    return supportedRoleList.length;
  }

  function getUserCount() public view returns(uint) {
    return userList.length;
  }

  function getUserDisplay(address _addr) view public returns (string) {
    return users[_addr].displayName;
  }

  function getUserRoleBitmask(address _addr) view public returns (uint) {
    uint numRoles = supportedRoleList.length;
    uint roles = 0;

    for (uint i=0; i<numRoles; i++) {
      if (hasRole(_addr, supportedRoleList[i])) {
        // TODO make use of bit shifting in constantinople
        roles = roles + 2**i;
      }
    }
    return roles;
  }

  function setUserRoles(address _addr, uint _newBitmask)
  onlyRbacAdmin
  doesNotDeleteLastAdmin
  checkUserExists(_addr)
  public returns (uint) {
    uint numRoles = supportedRoleList.length;
    uint maxMeaningfulBitMask = (2**numRoles) - 1;
    require(_newBitmask <= maxMeaningfulBitMask);

    for (uint i=0; i<numRoles; i++) {
      bool shouldHaveRole = (_newBitmask & 2**i) > 0;
      if (shouldHaveRole) {
        _grantRoleIfNotGrantedNoChecks(_addr, supportedRoleList[i]);
      } else {
        _revokeRoleIfGrantedNoChecks(_addr, supportedRoleList[i]);
      }
    }
    return _newBitmask;
  }

  function setUser(address _addr, string _display, uint _roles)
  onlyRbacAdmin
  checkUserExists(_addr)
  public {
    setUserDisplay(_addr, _display);
    setUserRoles(_addr, _roles);
  }

  function setUserDisplay(address _addr, string _display) public
  onlyRbacAdmin
  checkUserExists(_addr)
  {
    users[_addr].displayName = _display;
    emit DisplayChanged(_addr, _display);
  }
}
