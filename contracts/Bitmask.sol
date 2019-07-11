pragma solidity 0.5.10;

/**
* @title Library implementing bitmask operations
* @author TruSet
* @dev A maximum of 256 bits can be operated on when storing bits in a uint256, so the bitIndex is a uint8
*/

library Bitmask {
  function hasBit(uint256 bits, uint8 bitIndex) internal pure returns (bool) {
    return (bits & (uint(1) << bitIndex)) > 0;
  }

  function setBit(uint256 bits, uint8 bitIndex) internal pure returns (uint256) {
    uint256 bit = (uint(1) << bitIndex);
    return bits | bit;
  }

  function unsetBit(uint256 bits, uint8 bitIndex) internal pure returns (uint256) {
    uint256 bitmask = ~(uint(1) << bitIndex);
    return bits & bitmask;
  }
}
