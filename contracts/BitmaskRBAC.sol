pragma solidity ^0.4.22;

import "./Bitmask.sol";

/**
* @title Role-Based Access Control (RBAC) supporting bitmasks, for getting/setting multiple roles atomically
* @author TruSet
* @dev Use a bitmask to allow getting and setting of multiple roles in a single
*      transaction, to maintain lists/counts of users and roles, and to store an optional display name
*      for each user.
*
*      Originally based on an openzeppelin implementation, this implements a similar interface using bitmasks
*      natively
*
*      A maximum of 256 roles are supported, and roles cannot be removed once added.
* 
*      Only supported roles can be queried, because this makes us "fail fast" if we make typos and it
*      helps us to alleviate concerns around "look-a-like" strings. (See
*      https://github.com/OpenZeppelin/openzeppelin-solidity/issues/1090)
*/
contract BitmaskRBAC {
  using Bitmask for uint256;
  event DisplayChanged(address indexed addr, string display);
  // TODO: event for "new supported role"

  struct User {
    bool exists;
    string displayName;
    uint256 roleBitmask;
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
  mapping(string => uint) roleBitIndices;
  string[] public supportedRoleList;

  mapping(string => uint) userCountsByRole;
  event RoleAdded(address addr, string roleName);
  event RoleRemoved(address addr, string roleName);

  constructor()
  public
  {
    supportedRoles[ROLE_RBAC_ADMIN] = true;
    supportedRoleList.push(ROLE_RBAC_ADMIN);
    roleBitIndices[ROLE_RBAC_ADMIN] = 0;

    userList.push(msg.sender);

    User memory u =  User(true, "Contract creator", 2**0);
    users[msg.sender] = u;
    userCountsByRole[ROLE_RBAC_ADMIN]++;
    emit RoleAdded(msg.sender, ROLE_RBAC_ADMIN);
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
    require(roleExists(role), "role does not exist");
    _;
  }

  function roleExists(string role) view public returns (bool) {
    return supportedRoles[role];
  }

  function getUserCountByRole(string _role) view public returns (uint) {
    return userCountsByRole[_role];
  }

  function checkRole(address _operator, string _role)
  public view returns (bool) {
    require(hasRole(_operator, _role));
  }

  function addUserRole(string _role)
  onlyRbacAdmin
  external {
    uint numRoles = supportedRoleList.length;
    require(numRoles < 256); // because we use a uint256 as a bitmask
    require((bytes)(_role).length > 0);
    require(!roleExists(_role));

    supportedRoles[_role] = true;
    supportedRoleList.push(_role);
    roleBitIndices[_role] = numRoles;
  }

  function grantRole(address user, string roleName)
  onlyRbacAdmin
  checkUserExists(user)
  checkRoleExists(roleName)
  public {
    if (!hasRole(user, roleName)) {
      userCountsByRole[roleName]++;

      uint256 bitmask = users[user].roleBitmask;
      uint position = roleBitIndices[roleName];
      users[user].roleBitmask = bitmask.setBit(position);
      emit RoleAdded(user, roleName);
    }
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
    uint256 bitmask = users[_operator].roleBitmask;
    uint position = roleBitIndices[_role];
    return bitmask.hasBit(position);
  }

  function removeRole(address _operator, string _roleName) internal {
    uint256 bitmask = users[_operator].roleBitmask;
    uint position = roleBitIndices[_roleName];
    users[_operator].roleBitmask = bitmask.unsetBit(position);
    emit RoleRemoved(_operator, _roleName);
  }

  function revokeRole(address user, string roleName)
  onlyRbacAdmin
  doesNotDeleteLastAdmin
  checkUserExists(user)
  checkRoleExists(roleName)
  public {
    if (hasRole(user, roleName)) {
      userCountsByRole[roleName]--;
      removeRole(user, roleName);
    }
  }

  function newUser(address _addr, string _display, uint _roles) external
  onlyRbacAdmin
  {
    require(_addr != address(0));
    require(!userExists(_addr));

    userList.push(_addr);
    User memory u =  User(true, _display, 0);
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

  function getUsers() view public returns (address[]) {
    return userList;
  }

  function getUserDisplay(address _addr) view public returns (string) {
    return users[_addr].displayName;
  }

  function getUserRoleBitmask(address _addr) view public returns (uint) {
    return users[_addr].roleBitmask;
  }

  function setUserRoles(address _addr, uint _newBitmask)
  onlyRbacAdmin
  doesNotDeleteLastAdmin
  checkUserExists(_addr)
  public returns (uint) {
    uint numRoles = supportedRoleList.length;
    uint maxMeaningfulBitMask = (2**numRoles) - 1;
    require(_newBitmask <= maxMeaningfulBitMask);
    uint256 oldBitmask = users[_addr].roleBitmask;

    // Set
    users[_addr].roleBitmask = _newBitmask;

    // Side effects
    for (uint i=0; i<numRoles; i++) {
      bool shouldHaveRole = _newBitmask.hasBit(i);
      bool currentlyHasRole = oldBitmask.hasBit(i);
      string memory roleName = supportedRoleList[i];

      if (shouldHaveRole && !currentlyHasRole) {
        userCountsByRole[roleName]++;
        emit RoleAdded(_addr, roleName);
      } else if (!shouldHaveRole && currentlyHasRole) {
        userCountsByRole[roleName]--;
        emit RoleRemoved(_addr, roleName);
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
