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

import { AbiInput, AbiItem } from '../../caver-utils/src'

export interface Result {
    [k: string]: string | number
    __length__: number
}

export class ABI {
    decodeFunctionCall(abi: AbiItem, functionCall: string): Result
    decodeLog(inputs: AbiInput[], data: string, topics: string[]): Result
    decodeParameter(type: string | object, bytes: string): string
    decodeParameters(outputs: Array<string | object>, bytes: string): Result
    encodeContractDeploy(jsonInterface: AbiItem[], bytecode: string, args: any[]): string
    encodeEventSignature(functionName: AbiItem | string): string
    encodeFunctionCall(jsonInterface: AbiItem, params: any): string
    encodeFunctionSignature(functionName: AbiItem | string): string
    encodeParameter(type: string | object, param: any): string
    encodeParameters(types: Array<string | object>, params: any[]): string
}
