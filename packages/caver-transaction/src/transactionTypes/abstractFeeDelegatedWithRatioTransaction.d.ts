import AbstractFeeDelegatedTransaction from './abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from './abstractTransaction'

export default class AbstractFeeDelegatedWithRatioTransaction extends AbstractFeeDelegatedTransaction {
    constructor(typeString: string, createTxObj: CreateTransactionOptions)

    get feeRatio(): string
    set feeRatio(fr)
}