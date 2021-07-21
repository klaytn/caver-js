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

import WeightedMultiSigOptions from './weightedMultiSigOptions'

export const ACCOUNT_KEY_TAG: {
    ACCOUNT_KEY_NIL_TAG: '0x80'
    ACCOUNT_KEY_LEGACY_TAG: '0x01c0'
    ACCOUNT_KEY_PUBLIC_TAG: '0x02'
    ACCOUNT_KEY_FAIL_TAG: '0x03c0'
    ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG: '0x04'
    ACCOUNT_KEY_ROLE_BASED_TAG: '0x05'
}

export function fillWeightedMultiSigOptionsForMultiSig(
    lengthOfKeys: number,
    options?: WeightedMultiSigOptions | object
): WeightedMultiSigOptions

export function fillWeightedMultiSigOptionsForRoleBased(
    lengthOfKeys: number[],
    options?: WeightedMultiSigOptions[] | object[]
): WeightedMultiSigOptions[]