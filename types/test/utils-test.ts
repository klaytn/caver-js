/*
    Copyright 2021 The caver-js Authors
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

import BigNumber from 'bignumber.js'
import BN = require('bn.js')
import Caver, { Utils } from 'caver-js'
import { SignatureData } from 'packages/caver-wallet/src'

const caver = new Caver()

// $ExpectType Utils
caver.utils

// $ExpectType KlayUnit
caver.utils.klayUnit

// $ExpectType boolean
caver.utils.isAddress('address')

// $ExpectType boolean
caver.utils.isValidPrivateKey('private key')

// $ExpectType boolean
caver.utils.isKlaytnWalletKey('klaytn wallet key')

// $ExpectType boolean
caver.utils.isValidPublicKey('public key')

// $ExpectType string
caver.utils.compressPublicKey('public key')

// $ExpectType string
caver.utils.decompressPublicKey('public key')

// $ExpectType string
caver.utils.hashMessage('message')

// $ExpectType string[]
caver.utils.parseKlaytnWalletKey('klaytn wallet key')

// $ExpectType boolean
caver.utils.isHex('string')

// $ExpectType boolean
caver.utils.isHexStrict('string')

// $ExpectType string
caver.utils.addHexPrefix('string')

// $ExpectType string
caver.utils.stripHexPrefix('string')

// $ExpectType string | BN
caver.utils.convertToPeb(1, 'KLAY')
// $ExpectType string | BN
caver.utils.convertToPeb('0x1', 'KLAY')
// $ExpectType string | BN
caver.utils.convertToPeb(new BigNumber(1), 'KLAY')
// $ExpectType string | BN
caver.utils.convertToPeb(new BN(1), 'KLAY')
// $ExpectType string | BN
caver.utils.convertToPeb(1, caver.utils.klayUnit.KLAY)
// $ExpectType string | BN
caver.utils.convertToPeb('0x1', caver.utils.klayUnit.KLAY)
// $ExpectType string | BN
caver.utils.convertToPeb(new BigNumber(1), caver.utils.klayUnit.KLAY)
// $ExpectType string | BN
caver.utils.convertToPeb(new BN(1), caver.utils.klayUnit.KLAY)

// $ExpectType string
caver.utils.convertFromPeb(1, 'KLAY')
// $ExpectType string
caver.utils.convertFromPeb('0x1', 'KLAY')
// $ExpectType string
caver.utils.convertFromPeb(new BigNumber(1), 'KLAY')
// $ExpectType string
caver.utils.convertFromPeb(new BN(1), 'KLAY')
// $ExpectType string
caver.utils.convertFromPeb(1, caver.utils.klayUnit.KLAY)
// $ExpectType string
caver.utils.convertFromPeb('0x1', caver.utils.klayUnit.KLAY)
// $ExpectType string
caver.utils.convertFromPeb(new BigNumber(1), caver.utils.klayUnit.KLAY)
// $ExpectType string
caver.utils.convertFromPeb(new BN(1), caver.utils.klayUnit.KLAY)

const sig = new SignatureData(['0x01', '0x', '0x'])
// $ExpectType string
caver.utils.recover('message', ['0x01', '0x', '0x'])
// $ExpectType string
caver.utils.recover('message', sig)
// $ExpectType string
caver.utils.recover('message', { v: '0x01', r: '0x', s: '0x' })
// $ExpectType string
caver.utils.recover('message', { V: '0x01', R: '0x', S: '0x' })
// $ExpectType string
caver.utils.recover('message', ['0x01', '0x', '0x'], false)
// $ExpectType string
caver.utils.recover('message', sig, false)
// $ExpectType string
caver.utils.recover('message', { v: '0x01', r: '0x', s: '0x' }, false)
// $ExpectType string
caver.utils.recover('message', { V: '0x01', R: '0x', S: '0x' }, false)
