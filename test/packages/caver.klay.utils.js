/*
    Copyright 2018 The caver-js Authors
    This file is part of the caver-js library.
 
    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
 
    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.
 
    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

require('it-each')({ testPerIteration: true })
const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const setting = require('./setting')
const utils = require('./utils')
const Caver = require('../../index.js')
const BN = require('bn.js')

let caver
beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('caver.utils.randomHex', () => {
  context('input: valid value', () => {
    it.each(
      [0, 1, 2, 4, 32, 64],
      'should match with regex',
      (size) => {
        const data = caver.utils.randomHex(size)
        const regExp = new RegExp(`^0x[0-9a-f]{${size * 2}}$`)
        expect(data).to.match(regExp)
      }
    )
  })

  context('input: invalid value', () => {
    it('should throw an error: Invalid size: It must be >=0 && <= 65536', () => {
      const expectedErrorMessage = 'Invalid size: It must be >=0 && <= 65536'

      expect(() => caver.utils.randomHex(-1)).to.throw(expectedErrorMessage)
      expect(() => caver.utils.randomHex(65537)).to.throw(expectedErrorMessage)
    })
  })
})

describe('caver.utils.isBN', () => {
  context('input: BN type', () => {
    it.each([
        ['new BN(255)', new BN(255), true],
        [`new BN('ff', 16)`, new BN('ff', 16), true],
        [`new BN('377', 8)`, new BN('377', 8), true],
        [`new BN('11111111', 2)`, new BN('11111111', 2), true],
      ],
      'should return true',
      ([_, bn, expected]) => {
        const data = caver.utils.isBN(bn)
        expect(data).to.be.equal(expected)
      }
    )
  })

  context('input: not a BN type', () => {
    it.each([
        ['255', 255, false],
        ['0xff', 0xff, false],
        ['0377', 0o377, false],
        ['0b11111111', 0b11111111, false],
      ],
      'should return false',
      ([_, bn, expected]) => {
        const data = caver.utils.isBN(bn)
        expect(data).to.be.equal(expected)
      }
    )
  })
})

describe('caver.utils.isBigNumber', () => {
  const BigNumber = require('bignumber.js')

  context('input: BigNumber type', () => {
    it.each([
        ['new BigNumber(1.0000000000000001)', new BigNumber(1.0000000000000001), true],
        ['new BigNumber(88259496234518.57)', new BigNumber(88259496234518.57), true],
        ['new BigNumber(99999999999999999999)', new BigNumber(99999999999999999999), true],
        ['new BigNumber(2e+308)', new BigNumber(2e+308), true],
      ],
      'should return true',
      ([_, bigNumber, expected]) => {
        const data = caver.utils.isBigNumber(bigNumber)
        expect(data).to.be.equal(expected)
      }
    )
  })

  context('input: not a BigNumber type', () => {
    it.each([
        ['1.0000000000000001', 1.0000000000000001, false],
        ['88259496234518.57', 88259496234518.57, false],
        ['99999999999999999999', 99999999999999999999, false],
        ['2e+308', 2e+308, false],
      ],
      'should return false',
      ([_, bn, expected]) => {
        const data = caver.utils.isBigNumber(bn)
        expect(data).to.be.equal(expected)
      }
    )
  })
})

describe('caver.utils.sha3', () => {

  context('input: BigNumber type', () => {
    it.each([
        ['new BN(\'234\')', new BN('234'), '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79'],
      ],
      'should return 32 bytes hexstring',
      ([_, sha3Input, expected]) => {
        const data = caver.utils.sha3(sha3Input)
        expect(data).to.be.equal(expected)
      }
    )
  })

  context('input: number type', () => {
    it.each([
        ['234', 234, null],
        ['0xea', 0xea, null],
      ],
      'should return null',
      ([_, sha3Input, expected]) => {
        const data = caver.utils.sha3(sha3Input)
        expect(data).to.be.equal(expected)
      }
    )
  })

  context('input: String | HexString type', () => {
    it.each([
        ['\'234\'', '234', '0xc1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79'],
        ['\'0xea\'', '0xea', '0x2f20677459120677484f7104c76deb6846a2c071f9b3152c103bb12cd54d1a4a'],
      ],
      'should return 32 bytes hexstring',
      ([_, sha3Input, expected]) => {
        const data = caver.utils.sha3(sha3Input)
        expect(data).to.be.equal(expected)
      }
    )
  })
})

describe('caver.utils.soliditySha3', () => {
  it.each([
        ['\'234564535\', \'0xfff23243\', true, -10', ['234564535', '0xfff23243', true, -10], '0x3e27a893dc40ef8a7f0841d96639de2f58a132be5ae466d40087a2cfa83b7179'],
        ['\'Hello!%\'', ['Hello!%'], '0x661136a4267dba9ccdf6bfddb7c00e714de936674c4bdb065a531cf1cb15c7fc'],
        ['\'234\'', ['234'], '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2'],
        ['0xea', [0xea], '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2'],
        ['new BN(\'234\')', [new BN('234')], '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2'],
        ['{ type: \'uint256\', value: \'234\' }', [{ type: 'uint256', value: '234' }], '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2'],
        ['{ t: \'uint256\', v: \'234\' }', [{ t: 'uint', v: new BN('234') }], '0x61c831beab28d67d1bb40b5ae1a11e2757fa842f031a2d0bc94a7867bc5d26c2'],
        ['\'0x407D73d8a49eeb85D32Cf465507dd71d507100c1\'', ['0x407D73d8a49eeb85D32Cf465507dd71d507100c1'], '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b'],
        ['{ t: \'bytes\', v: \'0x407D73d8a49eeb85D32Cf465507dd71d507100c1\' }', [{ t: 'bytes', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }], '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b'],
        ['{ t: \'address\', v: \'0x407D73d8a49eeb85D32Cf465507dd71d507100c1\' }', [{ t: 'address', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }], '0x4e8ebbefa452077428f93c9520d3edd60594ff452a29ac7d2ccc11d47f3ab95b'],
        ['{ t: \'bytes32\', v: \'0x407D73d8a49eeb85D32Cf465507dd71d507100c1\' }', [{ t: 'bytes32', v: '0x407D73d8a49eeb85D32Cf465507dd71d507100c1' }], '0x3c69a194aaf415ba5d6afca734660d0a3d45acdc05d54cd1ca89a8988e7625b4'],
        ['{ t: \'string\', v: \'Hello! % \' }, { t: \'int8\', v: -23 }, { t: \'address\', v: \'0x85F43D8a49eeB85d32Cf465507DD71d507100C1d\' }', [{ t: 'string', v: 'Hello!%' }, { t: 'int8', v: -23 }, { t: 'address', v: '0x85F43D8a49eeB85d32Cf465507DD71d507100C1d' }], '0xa13b31627c1ed7aaded5aecec71baf02fe123797fffd45e662eac8e06fbe4955'],
      ],
      'should return 32 bytes hexstring',
      ([_, soliditySha3Input, expected]) => {
        const data = caver.utils.soliditySha3(...soliditySha3Input)
        expect(data).to.be.equal(expected)
      }
    )
})

describe('caver.utils.isHex', () => {
  context('input: hexString', () => {
    it.each([
        ['\'0xc1912\'', '0xc1912', true],
        ['0xc1912', 0xc1912, true],
        ['\'c1912\'', 'c1912', true],
        ['345', 345, true],
      ],
      'should return true',
      ([_, hex, expected]) => {
        const data = caver.utils.isHex(hex)
        expect(data).to.be.equal(expected)
      })
  })

  context('input: invalid hexString', () => {
    it.each([
        ['\'0xZ1912\'', '0xZ1912', false],
        ['\'Hello\'', 'Hello', false],
      ],
      'should return false',
      ([_, hex, expected]) => {
        const data = caver.utils.isHex(hex)
        expect(data).to.be.equal(expected)
      })
  })
})

describe('caver.utils.isHexStrict', () => {
  context('input: strict hexString', () => {
    it.each([
        ['\'0xc1912\'', '0xc1912', true],
      ],
      'should return true',
      ([_, hex, expected]) => {
        const data = caver.utils.isHexStrict(hex)
        expect(data).to.be.equal(expected)
      })
  })

  context('input: not strict hexString', () => {
    it.each([
        ['0xc1912', 0xc1912, false],
        ['\'c1912\'', 'c1912', false],
        ['345', 345, false],
        ['\'0xZ1912\'', '0xZ1912', false],
        ['\'Hello\'', 'Hello', false],
      ],
      'should return false',
      ([_, hex, expected]) => {
        const data = caver.utils.isHexStrict(hex)
        expect(data).to.be.equal(expected)
      })
  })
})

describe('caver.utils.isAddress', () => {
  context('input: valid address', () => {
    it.each([
        ['0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', true],
        ['c1912fee45d61c87cc5ea59dae31190fffff232d', true],
        ['0xc1912fee45d61c87cc5ea59dae31190fffff232d', true],
        ['0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', true],
      ],
      'should return true',
      ([address, expected]) => {
        const data = caver.utils.isAddress(address)
        expect(data).to.be.equal(expected)
      })
  })

  context('input: invalid address', () => {
    it.each([
        ['0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', false]
      ],
      'should return false',
      ([address, expected]) => {
        const data = caver.utils.isAddress(address)
        expect(data).to.be.equal(expected)
      })
  })
})

describe('caver.utils.toChecksumAddress', () => {
  context('input: valid address', () => {
    it.each([
        ['0xc1912fee45d61c87cc5ea59dae31190fffff232D', '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d'],
        ['0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d'],
        ['0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', '0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d']
      ],
      'should return checksum address',
      ([address, expected]) => {
        const data = caver.utils.toChecksumAddress(address)
        expect(data).to.be.equal(expected)
      })
  })

  context('input: invalid address', () => {
    it('should throw an error', () => {
      const invalidAddress = 'zzzz'
      const errorMessage = `Given address "${invalidAddress}" is not a valid Klaytn address.`
      expect(() => caver.utils.toChecksumAddress(invalidAddress)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.checkAddressChecksum', () => {
  context('input: valid checksum address', () => {
    it.each([
        ['0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', true],
      ],
      'should return true',
      ([address, expected]) => {
        const result = caver.utils.checkAddressChecksum(address)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: invalid checksum address', () => {
    it.each([
        ['0xc1912fee45d61c87cc5ea59dae31190fffff232d', false],
        ['c1912fee45d61c87cc5ea59dae31190fffff232d', false],
        ['0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D', false],
        ['0xC1912fEE45d61C87Cc5EA59DaE31190FFFFf232d', false],
      ],
      'should return false',
      ([address, expected]) => {
        const result = caver.utils.checkAddressChecksum(address)
        expect(result).to.be.equal(expected)
      }
    )
  })
})

describe('caver.utils.toHex', () => {
  const BN = require('bn.js')
  const BigNumber = require('bignumber.js')

  it.each([
      ['\'234\'', '234', '0xea'],
      ['234', 234, '0xea'],
      ['new BN(\'234\')', new BN('234'), '0xea'],
      ['new BigNumber(\'234\')', new BigNumber('234'), '0xea'],
      ['\'I have 100€\'', 'I have 100€', '0x49206861766520313030e282ac'],
    ],
    'should return hexstring',
    ([_, hex, expected]) => {
      const result = caver.utils.toHex(hex)
      expect(result).to.be.equal(expected)
    }
  )
})

describe('caver.utils.toBN', () => {
  const BN = require('bn.js')
  const BigNumber = require('bignumber.js')

  context('input: valid value', () => {
    it.each([
        ['1234', 1234, new BN(1234)],
        ['\'1234\'', '1234', new BN('1234')],
        ['0xea', 0xea, new BN(0xea)],
        ['\'0xea\'', '0xea', new BN('ea', 16)],
        ['new BN(234)', new BN(234), new BN(234)],
        ['new BN(\'234\')', new BN('234'), new BN('234')],
        ['new BigNumber(234)', new BigNumber(234), new BN(234)],
        ['new BigNumber(\'234\')', new BigNumber('234'), new BN('234')]
      ],
      'should return BigNumber type',
      ([_, number, expected]) => {
        const result = caver.utils.toBN(number)
        expect(result.toString()).to.be.equal(expected.toString())
      }
    )
  })

  context('input: invalid value', () => {
    it('should throw an error', () => {
      let invalid = 'zzzz'
      const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
      expect(() => caver.utils.toBN(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.hexToNumberString', () => {

  context('input: number', () => {
    it.each([
        ['1234', 1234, (1234).toString()],
        ['0x1234', 0x1234, (0x1234).toString()],
        ['0xea', 0xea, (0xea).toString()],
      ],
      'should return numberString',
      ([_, hex, expected]) => {
        const result = caver.utils.hexToNumberString(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: numberString', () => {
    it.each([
        ['\'1234\'', '1234', (1234).toString()],
      ],
      'should return numberString',
      ([_, hex, expected]) => {
        const result = caver.utils.hexToNumberString(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: hexString', () => {
    it.each([
        ['\'0x1234\'', '0x1234', (0x1234).toString()],
        ['\'0xea\'', '0xea', (0xea).toString()]
      ],
      'should return numberString',
      ([_, hex, expected]) => {
        const result = caver.utils.hexToNumberString(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: invalid hexString', () => {
    it('should throw an error', () => {
      let invalid = 'zzzz'
      const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
      expect(() => caver.utils.hexToNumberString(invalid)).to.throw(errorMessage)
    })
  })
})



// caver.utils.hexToNumber
describe('caver.utils.hexToNumber', () => {
  context('input: valid value', () => {
    it.each([
        ['1234', 1234, 1234],
        ['\'1234\'', '1234', 1234],
        ['0x1234', 0x1234, 4660],
        ['\'0x1234\'', '0x1234', 4660],
        ['0xea', 0xea, 234],
        ['\'0xea\'', '0xea', 234]
      ],
      'should return number',
      ([_, hex, expected]) => {
        const result = caver.utils.hexToNumber(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: invalid value', () => {
    it('should throw an error', () => {
      const invalid = 'zzzz'
      const errorMessage = `Error: [number-to-bn] while converting number "${invalid}" to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported. Given value: "${invalid}"`
      expect(() => caver.utils.hexToNumber(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.numberToHex', () => {
  const BN = require('bn.js')
  const BigNumber = require('bignumber.js')

  const toHexStr = (number) => '0x' + number.toString(16).toLowerCase()

  context('input: valid number', () => {
    it.each([
        ['1234', 1234, toHexStr(1234)],
        ['\'1234\'', '1234', toHexStr(1234)],
        ['0x1234', 0x1234, toHexStr(4660)],
        ['\'0x1234\'', '0x1234', toHexStr(4660)],
        ['new BN(234)', new BN(234), toHexStr(234)],
        ['new BN(\'234\')', new BN('234'), toHexStr(234)],
        ['new BigNumber(234)', new BigNumber(234), toHexStr(234)],
        ['new BigNumber(\'234\')', new BigNumber('234'), toHexStr(234)],
      ],
      'should return hexString',
      ([_, number, expected]) => {
        const result = caver.utils.numberToHex(number)
        expect(result).to.equal(expected)
      }
    )
  })

  context('input: invalid number', () => {
    it('should throw an error', () => {
      const invalid = 'zzzz'
      const errorMessage = `Given input "${invalid}" is not a number.`

      expect(() => caver.utils.numberToHex(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.hexToUtf8', () => {
  context('input: valid hexString', () => {
    it.each([
        ['0x49206861766520313030e282ac', 'I have 100€'],
        ['0x48656c6c6f2c204b6c6179746e', 'Hello, Klaytn']
      ],
      'should return utf8 string',
      ([hex, expected]) => {
        const result = caver.utils.hexToUtf8(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: invalid hexString', () => {
    it('should throw an error', () => {
      const invalid = 'zzzz'
      const errorMessage = `The parameter "${invalid}" must be a valid HEX string.`

      expect(() => caver.utils.hexToUtf8(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.hexToAscii', () => {

  context('input: valid hexString', () => {
    it.each([
        ['0x4920686176652031303021', 'I have 100!'],
        ['0x48656c6c6f2c204b6c6179746e', 'Hello, Klaytn'],
      ],
      'should return Ascii string',
      ([hex, expected]) => {
        const result = caver.utils.hexToAscii(hex)
        expect(result).to.be.equal(expected)
      }
    )
  })

  context('input: invalid hexString', () => {
    it('should throw an error', () => {
      const invalid = 'zzzz'
      const errorMessage = `The parameter must be a valid HEX string.`

      expect(() => caver.utils.hexToAscii(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.utf8ToHex', () => {
  it.each([
      ['I have 100€', '0x49206861766520313030e282ac'],
      ['Hello, Klaytn', '0x48656c6c6f2c204b6c6179746e']
    ],
    'should return hexString',
    ([string, expected]) => {
      const result = caver.utils.utf8ToHex(string)
      expect(result).to.be.equal(expected)
    }
  )
})

describe('caver.utils.asciiToHex', () => {
  it.each([
      ['I have 100!', '0x4920686176652031303021'],
      ['Hello, Klaytn', '0x48656c6c6f2c204b6c6179746e'],
    ],
    'should return hex String',
    ([string, expected]) => {
      const result = caver.utils.asciiToHex(string)
      expect(result).to.be.equal(expected)
    }
  )
})


describe('caver.utils.hexToBytes', () => {

  context('input: hexString \'0x000000ea\'', () => {
    it('should return bytes', () => {
      const hex = '0x000000ea'

      const expected = [0, 0, 0, 234]
      const result = caver.utils.hexToBytes(hex)
      expect(result).to.deep.equal(expected)
    })
  })

  context('input: invalid hexString', () => {
    it('should throw an error', () => {
      let invalid = 0x000000ea
      let errorMessage = `Given value "${invalid.toString(16)}" is not a valid hex string.`
      expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)

      invalid = 'zzzz'
      errorMessage = `Given value "${invalid}" is not a valid hex string.`
      expect(() => caver.utils.hexToBytes(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.utils.bytesToHex', () => {

  it.each([
      ['[0, 0, 0, 234]', [0, 0, 0, 234], '0x000000ea'],
      ['[234]', [234], '0xea']
    ],
    'should return byteArray',
    ([_, byteArray, expected]) => {
      const result = caver.utils.bytesToHex(byteArray)
      expect(result).deep.equal(expected)
    }
  )
})

describe('caver.utils.toPeb', () => {
  const BN = require('bn.js')
  const BigNumber = require('bignumber.js')

  const unitMap = utils.unitMap

  context('input: various type', () => {
    it.each([
        ['1', 1, unitMap.KLAY],
        ['\'1\'', '1', unitMap.KLAY],
        ['123456789', 123456789, (new BigNumber(unitMap.KLAY * 123456789)).toFixed(0)],
        ['\'123456789\'', '123456789', (new BigNumber(unitMap.KLAY * 123456789)).toFixed(0)],
        ['new BN(1)', new BN(1), unitMap.KLAY],
        ['new BN(\'1\')', new BN('1'), unitMap.KLAY],
        ['new BN(123456789)', new BN(123456789), (new BigNumber(unitMap.KLAY * 123456789)).toFixed(0)],
        ['new BN(\'123456789\')', new BN('123456789'), (new BigNumber(unitMap.KLAY * 123456789)).toFixed(0)]
      ],
      'should return string',
      ([_, number, expected]) => {
        const result = caver.utils.toPeb(number)
        expect(result.toString()).to.be.equal(expected.toString())
      }
    )
  })

  context('input: base unitmap', () => {
    it.each([
        ['1', 'peb', 1, unitMap.peb],
        ['1', 'kpeb', 1, unitMap.kpeb],
        ['1', 'Mpeb', 1, unitMap.Mpeb],
        ['1', 'Gpeb', 1, unitMap.Gpeb],
        ['1', 'uKLAY', 1, unitMap.uKLAY],
        ['1', 'mKLAY', 1, unitMap.mKLAY],
        ['1', 'KLAY', 1, unitMap.KLAY],
        ['1', 'kKLAY', 1, unitMap.kKLAY],
        ['1', 'MKLAY', 1, unitMap.MKLAY],
      ],
      'should return string',
      ([_, unit, number, expected]) => {
        const result = caver.utils.toPeb(number, unit)
        expect(result).to.be.equal(expected)
      }
    )
  })
})

describe('caver.utils.fromPeb', () => {
  const BN = require('bn.js')
  const BigNumber = require('bignumber.js')

  const unitMap = utils.unitMap


  it.each([
      ['1', 1, unitMap.KLAY],
      ['\'1\'', '1', unitMap.KLAY],
      ['123456789', 123456789, unitMap.KLAY],
      ['\'123456789\'', '123456789', unitMap.KLAY],
      ['new BN(1)', new BN(1), unitMap.KLAY],
      ['new BN(\'1\')', new BN('1'), unitMap.KLAY],
      ['new BN(123456789)', new BN(123456789), unitMap.KLAY],
      ['new BN(\'123456789\')', new BN('123456789'), unitMap.KLAY]
    ],
    'should return string based on unitMap',
    ([_, number, peb]) => {

      const bn = new BigNumber(peb)
      const expected = (Math.pow(0.1, bn.e) * number).toFixed(bn.e)

      const result = caver.utils.fromPeb(number)
      expect(result).to.be.equal(expected)
    }
  )

  it.each([
      ['1', 'peb', 1, unitMap.peb],
      ['1', 'kpeb', 1, unitMap.kpeb],
      ['1', 'Mpeb', 1, unitMap.Mpeb],
      ['1', 'Gpeb', 1, unitMap.Gpeb],
      ['1', 'uKLAY', 1, unitMap.uKLAY],
      ['1', 'mKLAY', 1, unitMap.mKLAY],
      ['1', 'KLAY', 1, unitMap.KLAY],
      ['1', 'kKLAY', 1, unitMap.kKLAY],
      ['1', 'MKLAY', 1, unitMap.MKLAY]
    ],
    'should return string based on unitMap',
    ([_, unit, number, peb]) => {
      const bn = new BigNumber(peb)
      const expected = (Math.pow(0.1, bn.e) * number).toFixed(bn.e)

      const result = caver.utils.fromPeb(number, unit)
      expect(result).to.be.equal(expected)
    }
  )
})

describe('caver.utils.unitMap', () => {
  const unitMap = utils.unitMap

  it('should return unitMap', () => {
    const result = caver.utils.unitMap
    expect(result).to.deep.equal(unitMap)
  })
})

describe('caver.utils.padLeft', () => {
  context('input: hexString', () => {
    it.each([
        ['0x3456ff', 20, '0x000000000000003456ff'],
        [0x3456ff, 20, '0x000000000000003456ff'],
      ],
      'should be left-padded with 0',
      ([string, characterAmount, expected]) => {
        const result = caver.utils.padLeft(string, characterAmount)
        expect(result).to.equal(expected)
      }
    )
  })

  context('input: string', () => {
    it.each([
        ['Hello', 20, 'x', 'xxxxxxxxxxxxxxxHello'],
      ],
      'should be left padded with x',
      ([string, characterAmount, sign, expected]) => {
        const result = caver.utils.padLeft(string, characterAmount, sign)
        expect(result).to.equal(expected)
      }
    )
  })
})

describe('caver.utils.padRight', () => {
  context('input: hexString', () => {
    it.each([
        ['0x3456ff', 20, '0x3456ff00000000000000'],
        [0x3456ff, 20, '0x3456ff00000000000000'],
      ],
      'should be right padded with 0',
      ([string, characterAmount, expected]) => {
        const result = caver.utils.padRight(string, characterAmount)
        expect(result).to.equal(expected)
      }
    )
  })

  context('input: string', () => {
    it.each([
        ['Hello', 20, 'x', 'Helloxxxxxxxxxxxxxxx']
      ],
      'should be right padded with x',
      ([string, characterAmount, sign, expected]) => {
        const result = caver.utils.padRight(string, characterAmount, sign)
        expect(result).to.equal(expected)
      }
    )
  })
})

describe('caver.utils.toTwosComplement', () => {

  it.each([
      ['\'-1\'', '-1', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
      ['-1', -1, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
      ['\'0x1\'', '0x1', '0x0000000000000000000000000000000000000000000000000000000000000001'],
      ['-15', -15, '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1'],
      ['\'-0x1\'', '-0x1', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
    ],
    'should return TwosComplement',
    ([_, number, expected]) => {
      const result = caver.utils.toTwosComplement(number)
      expect(result).to.equal(result)
    }
  )
})
