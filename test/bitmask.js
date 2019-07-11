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

  it('allows you to set a bit', async () => {
    await bitmaskMock.setBit(5) 
    await bitmaskMock.setBit(6)
    let result = await bitmaskMock.bitmask();
    let expected = (1 << 5) + (1 << 6)
    assert.equal(result, expected, 'should set the bit')
  })

  it('allows you to unset a bit', async () => {
    await bitmaskMock.setBit(5) 
    await bitmaskMock.setBit(6) 
    await bitmaskMock.unsetBit(6)
    let expected = 1 << 5
    
    let result = await bitmaskMock.bitmask();
    assert.equal(result, expected, 'should unset the bit')
  })
})
