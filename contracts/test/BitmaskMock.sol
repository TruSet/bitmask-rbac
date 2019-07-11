pragma solidity 0.5.10;

import "../Bitmask.sol";

contract BitmaskMock {
  using Bitmask for uint256;

  uint256 public bits;

  function reset() public returns (bool) {
    bits = 0;
    return true;
  }

  function hasBit(uint8 bitIndex) public view returns (bool) {
    return bits.hasBit(bitIndex);
  }

  function setBit(uint8 bitIndex) public returns (uint256) {
    bits = bits.setBit(bitIndex);
    return bits;
  }

  function unsetBit(uint8 bitIndex) public returns (uint256) {
    bits = bits.unsetBit(bitIndex);
    return bits;
  }
}