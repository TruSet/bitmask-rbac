pragma solidity 0.5.10;

/**
* @title Library implementing bitmask operations
* @author TruSet
* @dev A maximum of 256 bits can be operated on when storing this bitmask in a uint256
*/

library Bitmask {
  function hasBit(uint256 bitmask, uint position) internal pure returns (bool) {
    return (bitmask & 2**position) > 0;
  }

  function setBit(uint256 bitmask, uint position) internal pure returns (uint256) {
    if (!hasBit(bitmask, position)) {
      return (bitmask + 2**position);
    }
    return bitmask;
  }

  function unsetBit(uint256 bitmask, uint position) internal pure returns (uint256) {
    if (hasBit(bitmask, position)) {
      return bitmask - 2**position;
    }
    return bitmask;
  }
}
