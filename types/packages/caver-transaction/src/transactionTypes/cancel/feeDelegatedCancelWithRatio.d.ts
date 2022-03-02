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

import { AbstractFeeDelegatedWithRatioTransaction } from '../abstractFeeDelegatedWithRatioTransaction'
import { CreateTransactionObject } from '../abstractTransaction'

export class FeeDelegatedCancelWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    static create(createTxObj: string | CreateTransactionObject): FeeDelegatedCancelWithRatio
    static decode(rlpEncoded: string): FeeDelegatedCancelWithRatio

    constructor(createTxObj: string | CreateTransactionObject)

    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
    fillTransaction(): Promise<void>
    validateOptionalValues(): void

    gasPrice: string
    private _gasPrice: string
}
