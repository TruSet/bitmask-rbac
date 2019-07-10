pragma solidity ^0.4.22;

import "../Bitmask.sol";

contract BitmaskMock {
  using Bitmask for uint256;

  uint256 public bitmask;

  function reset() public returns (bool) {
    bitmask = 0;
    return true;
  }

  function hasBit(uint position) public view returns (bool) {
    return bitmask.hasBit(position);
  }

  function setBit(uint position) public returns (uint256) {
    bitmask = bitmask.setBit(position);
    return bitmask;
  }

  function unsetBit(uint position) public returns (uint256) {
    bitmask = bitmask.unsetBit(position);
    return bitmask;
  }
}
