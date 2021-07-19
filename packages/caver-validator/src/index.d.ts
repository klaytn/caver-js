import AbstractFeeDelegatedTransaction from '../../caver-transaction/src/transactionTypes/abstractFeeDelegatedTransaction'
import AbstractTransaction from '../../caver-transaction/src/transactionTypes/abstractTransaction'
import SignatureData from '../../caver-wallet/src/keyring/signatureData'

export default class Validator {
    validateSignedMessage(message: string, signatures: string[] | string[][] | SignatureData | SignatureData[], address: string, isHashed?: boolean): Promise<boolean>
    validateTransaction(tx: AbstractTransaction): Promise<boolean>
    validateSender(tx: AbstractTransaction): Promise<boolean>
    validateFeePayer(tx: AbstractFeeDelegatedTransaction): Promise<boolean>
}