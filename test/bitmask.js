let BitmaskMock = artifacts.require('./BitmaskMock.sol')

contract('BitmaskMock', () => {
  let bitmaskMock

  beforeEach(async () => {
    bitmaskMock = await BitmaskMock.new()
  })

  it('correctly identifiers a set bit', async () => {
    await bitmaskMock.setBit(5)
    let result = await bitmaskMock.hasBit(5)
    assert(result, 'bitmaskMock should have bit set')
  })

  it('correctly identifies an unset bit', async () => {
    await bitmaskMock.setBit(5)
    let result = await bitmaskMock.hasBit(6)
    assert(!result, 'bitmaskMock should not have bit set')
  })

  it('correctly identifies an unset high bit', async () => {
    await bitmaskMock.setBit(5)
    let result = await bitmaskMock.hasBit(255)
    assert(!result, 'bitmaskMock should not have high bit set')
  })

  it('allows you to set a bit', async () => {
    await bitmaskMock.setBit(5)
    await bitmaskMock.setBit(6)
    let result = await bitmaskMock.bits()
    let expected = (1 << 5) + (1 << 6)
    assert.equal(result, expected, 'should set the bit')
  })

  it('allows you to unset a bit', async () => {
    await bitmaskMock.setBit(5)
    await bitmaskMock.setBit(6)
    await bitmaskMock.unsetBit(6)
    let expected = 1 << 5

    let result = await bitmaskMock.bits()
    assert.equal(result, expected, 'should unset the bit')
  })

  it('allows you to set a high and low bits', async () => {
    await bitmaskMock.setBit(0)
    await bitmaskMock.setBit(255)
    let result = await bitmaskMock.bits()
    let expected =
      '57896044618658097711785492504343953926634992332820282019728792003956564819969'
    assert.equal(result.toString(), expected, 'should set the bits')

    let hasHighBit = await bitmaskMock.hasBit(255)
    let hasLowBit = await bitmaskMock.hasBit(0)
    assert.equal(hasHighBit, true, 'high bit is set')
    assert.equal(hasLowBit, true, 'low bit is set')
  })

  it('allows you to unset high and low bits', async () => {
    await bitmaskMock.setBit(0)
    await bitmaskMock.setBit(255)
    await bitmaskMock.unsetBit(255)
    let expected = 1

    let result = await bitmaskMock.bits()
    assert.equal(result, expected, 'should unset the bit')
  })
})
