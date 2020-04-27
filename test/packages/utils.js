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

const Keyring = require('../../packages/caver-wallet/src/keyring/keyring')
const { KEY_ROLE } = require('../../packages/caver-wallet/src/keyring/keyringHelper')
const PrivateKey = require('../../packages/caver-wallet/src/keyring/privateKey')

const unitMap = {
    peb: '1',
    kpeb: '1000',
    Mpeb: '1000000',
    Gpeb: '1000000000',
    Ston: '1000000000',
    uKLAY: '1000000000000',
    mKLAY: '1000000000000000',
    KLAY: '1000000000000000000',
    kKLAY: '1000000000000000000000',
    MKLAY: '1000000000000000000000000',
    GKLAY: '1000000000000000000000000000',
}

const generateDecoupledKeyring = () => {
    const keyring = Keyring.generate()
    keyring.key = PrivateKey.generate()
    return keyring
}

const generateMultiSigKeyring = (num = 3) => {
    const keyring = Keyring.generate()
    const multipleKeys = []
    for (let i = 0; i < num; i++) {
        multipleKeys.push(PrivateKey.generate())
    }
    keyring.key = multipleKeys
    return keyring
}

const generateRoleBasedKeyring = numArr => {
    if (numArr === undefined) {
        numArr = Array(KEY_ROLE.ROLE_LAST).fill(1)
    }
    const keyring = Keyring.generate()
    const roleBased = []
    for (let i = 0; i < numArr.length; i++) {
        const keys = []
        for (let j = 0; j < numArr[i]; j++) {
            keys.push(PrivateKey.generate())
        }
        roleBased.push(keys)
    }
    keyring.key = roleBased
    return keyring
}

module.exports = {
    unitMap,
    generateDecoupledKeyring,
    generateMultiSigKeyring,
    generateRoleBasedKeyring,
}
