/*
    Copyright 2022 The caver-js Authors
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

import { AccessTuple, AccessTupleObject, EncodedAccessTuple } from './accessTuple'

export type AccessListObject = AccessTupleObject[]

export interface AccessListResult {
    accessList: AccessListObject
    gasUsed: string
    error: string
}

export class AccessList extends Array {
    static create(items: AccessTuple[] | AccessTupleObject[]): AccessList
    static decode(encoded: string): AccessList

    encodeToBytes(): EncodedAccessTuple[]
    isEqual(acl: AccessList): boolean
    toObject(): AccessTupleObject[]
}
