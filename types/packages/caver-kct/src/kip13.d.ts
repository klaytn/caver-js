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

import { Contract } from '../../caver-contract/src'
import { AbiItem } from '../../caver-utils/src'

export class KIP13 extends Contract {
    static isImplementedKIP13Interface(contractAddress: string): Promise<boolean>

    constructor(contractAddress: string, abi: AbiItem[])

    sendQuery(interfaceId: string): Promise<boolean>
}
