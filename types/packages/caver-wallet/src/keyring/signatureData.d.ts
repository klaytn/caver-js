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

export default class SignatureData {
    constructor(signature: string[] | SignatureData)

    emptySig: SignatureData

    isEmpty(): boolean
    encode(): string[]
    toString(): string
    isEqual(sig: SignatureData | SignatureData[]): boolean

    private _v: string
    public v: string
    private _V: string
    public V: string
    private _r: string
    public r: string
    private _R: string
    public R: string
    private _s: string
    public s: string
    private _S: string
    public S: string
}
