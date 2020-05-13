/*
    Copyright 2020 The caver-js Authors
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

const _ = require('lodash')

const KEY_ROLE = {
    RoleTransactionKey: 0,
    0: 'RoleTransactionKey',
    RoleAccountUpdateKey: 1,
    1: 'RoleAccountUpdateKey',
    RoleFeePayerKey: 2,
    2: 'RoleFeePayerKey',
    RoleLast: 3,
}

const MAXIMUM_KEY_NUM = 10

const isMultipleKeysFormat = keys => {
    if (!_.isArray(keys)) return false
    return keys.every(key => {
        return _.isString(key)
    })
}

const isRoleBasedKeysFormat = roledBasedKeyArray => {
    if (!_.isArray(roledBasedKeyArray)) return false
    if (roledBasedKeyArray.length > KEY_ROLE.RoleLast) return false

    return roledBasedKeyArray.every(arr => {
        return _.isArray(arr)
    })
}

module.exports = {
    KEY_ROLE,
    MAXIMUM_KEY_NUM,
    isMultipleKeysFormat,
    isRoleBasedKeysFormat,
}
