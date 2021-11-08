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

export class Subscriptions {
    constructor(options: SubscriptionsOptions)

    name: string
    type: string
    subscriptions: SubscriptionsModel
    readonly requestManager: any

    attachToObject(obj: any): void

    setRequestManager(requestManager: any): void

    buildCall(): () => any
}

export interface SubscriptionsOptions {
    name: string
    type: string
    subscriptions: SubscriptionsModel
}

export interface SubscriptionsModel {
    [name: string]: SubscriptionModel
}

export interface SubscriptionModel {
    subscriptionName: string
    params: number
    outputFormatter: () => void
    inputFormatter: Array<() => void>
    subscriptionHandler: () => void
}
