export default class Iban {
    toAddress(ib: string): string
    toIban(address: string): string
    fromAddress(address: string): Iban
    fromBban(bban: string): Iban
    createIndirect(options?: object): Iban
    isValid(): boolean
    isValid(iban: string): boolean
    isDirect(): boolean
    isIndirect(): boolean
    checksum(): string
    institution(): string
    client(): string
    toAddress(): string
    toString(): string
}