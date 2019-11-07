/*
    Copyright 2018 The caver-js Authors
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

const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

const { parseAccountKey } = require('../packages/caver-klay/caver-klay-accounts/src/transactionType/account')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

function isEqualMultiSigKey(multisig1, multisig2) {
    if (multisig1.keys.length !== multisig2.keys.length) return false
    if (multisig1.threshold !== multisig2.threshold) return false

    multisig1.keys = multisig1.keys.map(k => {
        k.publicKey = caver.utils.compressPublicKey(k.publicKey)
        return k
    })
    multisig2.keys = multisig2.keys.map(k => {
        k.publicKey = caver.utils.compressPublicKey(k.publicKey)
        return k
    })

    for (let i = 0; i < multisig1.keys.length; i++) {
        if (multisig1.keys[i].weight !== multisig2.keys[i].weight) return false
        if (multisig1.keys[i].publicKey !== multisig2.keys[i].publicKey) return false
    }

    return true
}
describe('parseAccountKey', () => {
    it('CAVERJS-UNIT-SER-027: parseAccountKey with legacyKey', () => {
        const txObj = { accountKey: '0x01c0' }
        const parsed = parseAccountKey(txObj)
        expect(parsed.legacyKey).not.to.be.undefined
        expect(parsed.legacyKey).to.be.true
    })

    it('CAVERJS-UNIT-SER-028: parseAccountKey with failKey', () => {
        const txObj = { accountKey: '0x03c0' }
        const parsed = parseAccountKey(txObj)
        expect(parsed.failKey).not.to.be.undefined
        expect(parsed.failKey).to.be.true
    })

    it('CAVERJS-UNIT-SER-029: parseAccountKey with publicKey', () => {
        const pubKey =
            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b'
        const compressed = caver.utils.compressPublicKey(pubKey)
        const txObj = { accountKey: '0x02a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fc' }
        const parsed = parseAccountKey(txObj)
        expect(parsed.publicKey).not.to.be.undefined
        expect(parsed.publicKey).to.equals(compressed)
    })

    it('CAVERJS-UNIT-SER-030: parseAccountKey with multisig', () => {
        const multisig = {
            threshold: 5,
            keys: [
                {
                    weight: 1,
                    publicKey:
                        '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b',
                },
                {
                    weight: 2,
                    publicKey:
                        '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52',
                },
                {
                    weight: 3,
                    publicKey:
                        '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14',
                },
                {
                    weight: 4,
                    publicKey:
                        '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14',
                },
            ],
        }
        const txObj = {
            accountKey:
                '0x04f89305f890e301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de304a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.multisig).not.to.be.undefined
        expect(parsed.multisig.keys).not.to.be.undefined
        expect(isEqualMultiSigKey(parsed.multisig, multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-031: parseAccountKey with roleTransactionKey with publicKey', () => {
        const roleTransactionKey = {
            publicKey:
                '0xfcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a4001b225c4b7d352fe9a2a016ebdcf6f044b76f425c4cadce11775c54ca68647',
        }
        const txObj = { accountKey: '0x05e4a302a103fcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a' }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).to.be.undefined
        expect(parsed.roleFeePayerKey).to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).to.equals(caver.utils.compressPublicKey(roleTransactionKey.publicKey))
    })

    it('CAVERJS-UNIT-SER-032: parseAccountKey with roleTransactionKey with multisig', () => {
        const roleTransactionKey = {
            multisig: {
                threshold: 5,
                keys: [
                    {
                        weight: 1,
                        publicKey:
                            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b',
                    },
                    {
                        weight: 2,
                        publicKey:
                            '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52',
                    },
                    {
                        weight: 3,
                        publicKey:
                            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14',
                    },
                    {
                        weight: 4,
                        publicKey:
                            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14',
                    },
                ],
            },
        }
        const txObj = {
            accountKey:
                '0x05f898b89604f89305f890e301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de304a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).to.be.undefined
        expect(parsed.roleFeePayerKey).to.be.undefined
        expect(isEqualMultiSigKey(parsed.roleTransactionKey.multisig, roleTransactionKey.multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-033: parseAccountKey with roleTransactionKey and roleAccountUpdateKey publicKey', () => {
        const roleTransactionKey = {
            publicKey:
                '0xfcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a4001b225c4b7d352fe9a2a016ebdcf6f044b76f425c4cadce11775c54ca68647',
        }
        const roleAccountUpdateKey = {
            publicKey:
                '0xc7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66d3b269c935ee34600cba4269a55908a43f720e05e9eed6023967e763af4c1770a',
        }
        const txObj = {
            accountKey:
                '0x05f848a302a103fcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412aa302a102c7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66d',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).to.equals(caver.utils.compressPublicKey(roleTransactionKey.publicKey))
        expect(parsed.roleAccountUpdateKey.publicKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey.publicKey).to.equals(caver.utils.compressPublicKey(roleAccountUpdateKey.publicKey))
    })

    it('CAVERJS-UNIT-SER-034: parseAccountKey with roleTransactionKey and roleAccountUpdateKey with multisig', () => {
        const publicKey1 =
            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b'
        const publicKey2 =
            '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52'
        const publicKey3 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const publicKey4 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const roleTransactionKey = {
            multisig: {
                threshold: 5,
                keys: [
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                    { weight: 3, publicKey: publicKey3 },
                    { weight: 4, publicKey: publicKey4 },
                ],
            },
        }
        const roleAccountUpdateKey = {
            multisig: {
                threshold: 2,
                keys: [{ weight: 1, publicKey: publicKey3 }, { weight: 1, publicKey: publicKey4 }, { weight: 1, publicKey: publicKey1 }],
            },
        }
        const txObj = {
            accountKey:
                '0x05f9010cb89604f89305f890e301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de304a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2db87204f86f02f86ce301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fc',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).to.be.undefined
        expect(isEqualMultiSigKey(parsed.roleTransactionKey.multisig, roleTransactionKey.multisig)).to.be.true
        expect(isEqualMultiSigKey(parsed.roleAccountUpdateKey.multisig, roleAccountUpdateKey.multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-035: parseAccountKey with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey with publicKey', () => {
        const roleTransactionKey = {
            publicKey:
                '0xfcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a4001b225c4b7d352fe9a2a016ebdcf6f044b76f425c4cadce11775c54ca68647',
        }
        const roleAccountUpdateKey = {
            publicKey:
                '0xc7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66d3b269c935ee34600cba4269a55908a43f720e05e9eed6023967e763af4c1770a',
        }
        const roleFeePayerKey = {
            publicKey:
                '0x9a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526f743f2b75ff96c20b662ac2cdde54a2fbc199a0ffbb5eb5e94b6671127ecce3a',
        }

        const txObj = {
            accountKey:
                '0x05f86ca302a103fcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412aa302a102c7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66da302a1029a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).to.equals(caver.utils.compressPublicKey(roleTransactionKey.publicKey))
        expect(parsed.roleAccountUpdateKey.publicKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey.publicKey).to.equals(caver.utils.compressPublicKey(roleAccountUpdateKey.publicKey))
        expect(parsed.roleFeePayerKey.publicKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey.publicKey).to.equals(caver.utils.compressPublicKey(roleFeePayerKey.publicKey))
    })

    it('CAVERJS-UNIT-SER-036: parseAccountKey with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey with multisig', () => {
        const publicKey1 =
            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b'
        const publicKey2 =
            '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52'
        const publicKey3 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const publicKey4 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const roleTransactionKey = {
            multisig: {
                threshold: 5,
                keys: [
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                    { weight: 3, publicKey: publicKey3 },
                    { weight: 4, publicKey: publicKey4 },
                ],
            },
        }
        const roleAccountUpdateKey = {
            multisig: {
                threshold: 2,
                keys: [{ weight: 1, publicKey: publicKey3 }, { weight: 1, publicKey: publicKey4 }, { weight: 1, publicKey: publicKey1 }],
            },
        }
        const roleFeePayerKey = {
            multisig: {
                threshold: 3,
                keys: [
                    { weight: 1, publicKey: publicKey3 },
                    { weight: 1, publicKey: publicKey4 },
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                ],
            },
        }

        const txObj = {
            accountKey:
                '0x05f901a4b89604f89305f890e301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de304a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2db87204f86f02f86ce301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fcb89604f89303f890e301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(isEqualMultiSigKey(parsed.roleTransactionKey.multisig, roleTransactionKey.multisig)).to.be.true
        expect(isEqualMultiSigKey(parsed.roleAccountUpdateKey.multisig, roleAccountUpdateKey.multisig)).to.be.true
        expect(isEqualMultiSigKey(parsed.roleFeePayerKey.multisig, roleFeePayerKey.multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-037: parseAccountKey with acocuntKeyNil, roleAccountUpdateKey and roleFeePayerKey with publicKey', () => {
        const roleAccountUpdateKey = {
            publicKey:
                '0xc7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66d3b269c935ee34600cba4269a55908a43f720e05e9eed6023967e763af4c1770a',
        }
        const roleFeePayerKey = {
            publicKey:
                '0x9a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526f743f2b75ff96c20b662ac2cdde54a2fbc199a0ffbb5eb5e94b6671127ecce3a',
        }
        const txObj = {
            accountKey:
                '0x05f84a8180a302a102c7d5d73320271da2b39ef50c9dc77bc7a825bb0102bc84147bc9c4faeb1de66da302a1029a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey.publicKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey.publicKey).to.equals(caver.utils.compressPublicKey(roleAccountUpdateKey.publicKey))
        expect(parsed.roleFeePayerKey.publicKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey.publicKey).to.equals(caver.utils.compressPublicKey(roleFeePayerKey.publicKey))
    })

    it('CAVERJS-UNIT-SER-038: parseAccountKey with acocuntKeyNil, roleAccountUpdateKey and roleFeePayerKey with multisig', () => {
        const publicKey1 =
            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b'
        const publicKey2 =
            '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52'
        const publicKey3 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const publicKey4 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const roleAccountUpdateKey = {
            multisig: {
                threshold: 2,
                keys: [{ weight: 1, publicKey: publicKey3 }, { weight: 1, publicKey: publicKey4 }, { weight: 1, publicKey: publicKey1 }],
            },
        }
        const roleFeePayerKey = {
            multisig: {
                threshold: 3,
                keys: [
                    { weight: 1, publicKey: publicKey3 },
                    { weight: 1, publicKey: publicKey4 },
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                ],
            },
        }
        const txObj = {
            accountKey:
                '0x05f9010e8180b87204f86f02f86ce301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fcb89604f89303f890e301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).to.be.undefined
        expect(parsed.roleAccountUpdateKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(isEqualMultiSigKey(parsed.roleAccountUpdateKey.multisig, roleAccountUpdateKey.multisig)).to.be.true
        expect(isEqualMultiSigKey(parsed.roleFeePayerKey.multisig, roleFeePayerKey.multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-039: parseAccountKey with roleTransactionKey, acocuntKeyNil and roleFeePayerKey with publicKey', () => {
        const roleTransactionKey = {
            publicKey:
                '0xfcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a4001b225c4b7d352fe9a2a016ebdcf6f044b76f425c4cadce11775c54ca68647',
        }
        const roleFeePayerKey = {
            publicKey:
                '0x9a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526f743f2b75ff96c20b662ac2cdde54a2fbc199a0ffbb5eb5e94b6671127ecce3a',
        }

        const txObj = {
            accountKey:
                '0x05f84aa302a103fcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a8180a302a1029a142042e23a0a13342ff2e526c3940cdadc0af733fc0f319f6f9efa8900a526',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).not.to.be.undefined
        expect(parsed.roleTransactionKey.publicKey).to.equals(caver.utils.compressPublicKey(roleTransactionKey.publicKey))
        expect(parsed.roleFeePayerKey.publicKey).not.to.be.undefined
        expect(parsed.roleFeePayerKey.publicKey).to.equals(caver.utils.compressPublicKey(roleFeePayerKey.publicKey))
    })

    it('CAVERJS-UNIT-SER-040: parseAccountKey with roleTransactionKey, acocuntKeyNil and roleFeePayerKey with multisig', () => {
        const publicKey1 =
            '0x501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce97bb2676ce2dab476f6aad3b1c3b1a4e3b6daef45c1e3e4825b49a53a829e5b'
        const publicKey2 =
            '0x05274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b11a0bc5a473dfc3a1756ad5238a534f81002381ee03e0a09d5e5b13155a8eb52'
        const publicKey3 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const publicKey4 =
            '0xfcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d5c9f40bded473f5d39182bebbbbe78d137a8f82ca076a97436503d99033acf14'
        const roleTransactionKey = {
            multisig: {
                threshold: 5,
                keys: [
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                    { weight: 3, publicKey: publicKey3 },
                    { weight: 4, publicKey: publicKey4 },
                ],
            },
        }
        const roleFeePayerKey = {
            multisig: {
                threshold: 3,
                keys: [
                    { weight: 1, publicKey: publicKey3 },
                    { weight: 1, publicKey: publicKey4 },
                    { weight: 1, publicKey: publicKey1 },
                    { weight: 2, publicKey: publicKey2 },
                ],
            },
        }
        const txObj = {
            accountKey:
                '0x05f90132b89604f89305f890e301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063be303a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de304a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2d8180b89604f89303f890e301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a102fcde89952a548fc0f6e32183eef6738eeea290d6d01af28bc03fbb6ed4f66d2de301a103501406a8a3d82927868980d16ca16d3efe768a2ffb44b4a03632f8265e0331fce302a10205274ea06b36a35f123400d3d95f3b460aa2ac069749582fd7322f1ff36c063b',
        }
        const parsed = parseAccountKey(txObj)

        expect(parsed.roleTransactionKey).not.to.be.undefined
        expect(parsed.roleAccountUpdateKey).to.be.undefined
        expect(parsed.roleFeePayerKey).not.to.be.undefined
        expect(isEqualMultiSigKey(parsed.roleTransactionKey.multisig, roleTransactionKey.multisig)).to.be.true
        expect(isEqualMultiSigKey(parsed.roleFeePayerKey.multisig, roleFeePayerKey.multisig)).to.be.true
    })

    it('CAVERJS-UNIT-SER-062: if roleBasedKey is nested, throw error.', () => {
        const txObj = { accountKey: '0x05efaa05e8a302a103fcafb7e46cfd0b0164c96531883c2968893edb6bc956ee91048d4ac9d6a3412a8180818081808180' }

        expect(() => parseAccountKey(txObj)).to.throws('Nested role based key.')
    })
})
