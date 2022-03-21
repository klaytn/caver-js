/*
    Copyright 2020 The caver-js Authors
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

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const RLP = require('eth-lib/lib/rlp')

const { propertiesForUnnecessary } = require('../utils')

const testRPCURL = require('../../testrpc')
const Caver = require('../../../index')
const Keyring = require('../../../packages/caver-wallet/src/keyring/keyringFactory')
const SingleKeyring = require('../../../packages/caver-wallet/src/keyring/singleKeyring')
const TransactionHasher = require('../../../packages/caver-transaction/src/transactionHasher/transactionHasher')

const { generateRoleBasedKeyring, makeAccount, accountKeyTestCases, checkSignature, checkFeePayerSignature } = require('../utils')

let caver
let sender
let feePayer
let roleBasedKeyring

let txObjWithLegacy
let txObjWithPublic
let txObjWithFail
let txObjWithMultiSig
let txObjWithRoleBased

const expectedValues = []
let txsByAccountKeys = []

const sandbox = sinon.createSandbox()

function makeAccountUpdateObjectWithExpectedValues() {
    {
        const testAddress = '0x5c525570f2b8e7e25f3a6b5e17f2cc63b872ece7'
        const account = caver.account.createWithAccountKeyLegacy(testAddress)

        const tx = {
            from: testAddress,
            account,
            gas: '0x493e0',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            feeRatio: 30,
            signatures: [
                [
                    '0x0fea',
                    '0x8d45728ca7a288d27f70c6b7153624b6c3dabd8f345e63049048b2b1787aae1e',
                    '0x370d2c5cf3cd99dc0a6ecaca75e30cc5e030ea71bf72fada047ace020c7410f0',
                ],
            ],
            feePayer: '0x294f5bc8fadbd1079b191d9c47e1f217d6c987b4',
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0x550440015be09e0020f3cf6173c862420e2982c77f6a0a43d607b153bb7abd6c',
                    '0x67ca2a849a5e14992d3e9dff3562b1ac9856ff89f383c34645925fec12b3fdf9',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.LEGACY].tx = tx
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingForSigning =
            '0xeca6e522808505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78201c01e8207e38080'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingForFeePayerSigning =
            '0xf841a6e522808505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78201c01e94294f5bc8fadbd1079b191d9c47e1f217d6c987b48207e38080'
        expectedValues[accountKeyTestCases.LEGACY].senderTxHash = '0x64e837cb9b7bdc3bffc8c37731ba60de47570da931b817139cf11b4fb1cc3a5e'
        expectedValues[accountKeyTestCases.LEGACY].transactionHash = '0xbfc73185429a9b5310dd159d16e44e6d63f2e278bf1aaa12be48827f2dee9d43'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncoding =
            '0x22f8cb808505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78201c01ef847f845820feaa08d45728ca7a288d27f70c6b7153624b6c3dabd8f345e63049048b2b1787aae1ea0370d2c5cf3cd99dc0a6ecaca75e30cc5e030ea71bf72fada047ace020c7410f094294f5bc8fadbd1079b191d9c47e1f217d6c987b4f847f845820fe9a0550440015be09e0020f3cf6173c862420e2982c77f6a0a43d607b153bb7abd6ca067ca2a849a5e14992d3e9dff3562b1ac9856ff89f383c34645925fec12b3fdf9'
    }
    {
        const testAddress = '0x5c525570f2b8e7e25f3a6b5e17f2cc63b872ece7'
        const pubKey =
            '0xa1d2af887950891813bf7d851bce55f47246a5269a5d4be1fc0ab78d78ae0f5a5cce7537f5a3776df303d240c0f730301df6be668907a1106adb0dbbef0beb3c'
        const account = caver.account.createWithAccountKeyPublic(testAddress, pubKey)

        const tx = {
            from: testAddress,
            account,
            gas: '0x493e0',
            nonce: '0x1',
            gasPrice: '0x5d21dba00',
            feeRatio: 30,
            signatures: [
                [
                    '0x0fea',
                    '0x8553a692cd8f86af4d335785468a5b4527ee1a2d0c5e18517fe39375e4e82d85',
                    '0x698db3a07cc81427eb8ea877bb8af33d66abfb29526f58db6997eb99010be4fd',
                ],
            ],
            feePayer: '0x294f5bc8fadbd1079b191d9c47e1f217d6c987b4',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0xa44cbc6e30f9df61633ed1714014924b8b614b315288cdfd795c5ba18d36d5d8',
                    '0x011611104f18e3bb3d32508317a0ce6d31f0a71d55e2363b02a47aabbc7bf9d4',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.PUBLIC].tx = tx
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingForSigning =
            '0xf84fb848f84622018505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7a302a102a1d2af887950891813bf7d851bce55f47246a5269a5d4be1fc0ab78d78ae0f5a1e8207e38080'
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingForFeePayerSigning =
            '0xf864b848f84622018505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7a302a102a1d2af887950891813bf7d851bce55f47246a5269a5d4be1fc0ab78d78ae0f5a1e94294f5bc8fadbd1079b191d9c47e1f217d6c987b48207e38080'
        expectedValues[accountKeyTestCases.PUBLIC].senderTxHash = '0xa9b2afdc79d7a647b1b8d38d552141f785ae8d37448aef1487a4dbd262165da0'
        expectedValues[accountKeyTestCases.PUBLIC].transactionHash = '0x265ad666c91db8355a620831698b26e6504a5770a5d0d1d7f5a6706ee2387616'
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncoding =
            '0x22f8ec018505d21dba00830493e0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7a302a102a1d2af887950891813bf7d851bce55f47246a5269a5d4be1fc0ab78d78ae0f5a1ef847f845820feaa08553a692cd8f86af4d335785468a5b4527ee1a2d0c5e18517fe39375e4e82d85a0698db3a07cc81427eb8ea877bb8af33d66abfb29526f58db6997eb99010be4fd94294f5bc8fadbd1079b191d9c47e1f217d6c987b4f847f845820feaa0a44cbc6e30f9df61633ed1714014924b8b614b315288cdfd795c5ba18d36d5d8a0011611104f18e3bb3d32508317a0ce6d31f0a71d55e2363b02a47aabbc7bf9d4'
    }
    {
        const testAddress = '0x5c525570f2b8e7e25f3a6b5e17f2cc63b872ece7'
        const account = caver.account.createWithAccountKeyFail(testAddress)

        const tx = {
            from: testAddress,
            account,
            gas: '0x186a0',
            nonce: '0x4',
            gasPrice: '0x5d21dba00',
            feeRatio: 30,
            signatures: [
                [
                    '0x0fe9',
                    '0xfe43c4044a682a0f14489a4dabc94efdbf2838cff255911b059baf53511050e6',
                    '0x2fde2475ca919e313a6bb5cafe8ed3b61651c8cc6ff939f88c36c11b805d6530',
                ],
                [
                    '0x0fea',
                    '0x0b17cb389f0dbc9f65d22255b82a0c440f6033f2cc5ec0deff11da3e2e515d14',
                    '0x1ba420aa515ac311812724a441e3f772b19536735ced7a0d989c50063d73aa58',
                ],
                [
                    '0x0fe9',
                    '0xdc7fac293ee42ef4f113414bc391b8f976c95e10ff364a74a4564b8c9bd6af7a',
                    '0x4e0513eb4ee7359d631be46f8b7f44c0049b9f4752565b1978fcd2260fc8103d',
                ],
            ],
            feePayer: '0x294f5bc8fadbd1079b191d9c47e1f217d6c987b4',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0x409bdfe4239de15901ca37e54ab632a95cbced6a17ff85203d5c15ae140405f9',
                    '0x464cd266e2a207589508d9d6241e93fe637476e8562e755c4d133875d7afe0dc',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.FAIL].tx = tx
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingForSigning =
            '0xeca6e522048505d21dba00830186a0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78203c01e8207e38080'
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingForFeePayerSigning =
            '0xf841a6e522048505d21dba00830186a0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78203c01e94294f5bc8fadbd1079b191d9c47e1f217d6c987b48207e38080'
        expectedValues[accountKeyTestCases.FAIL].senderTxHash = '0xfff1eba87cac6c60316441b05af9cf920612a3471fa188686bc6b8ee7ef120be'
        expectedValues[accountKeyTestCases.FAIL].transactionHash = '0xe36dbee2c9c52a1d108794b69deb56efd40c250ef686b895ee9410b815d7eee4'
        expectedValues[accountKeyTestCases.FAIL].rlpEncoding =
            '0x22f90159048505d21dba00830186a0945c525570f2b8e7e25f3a6b5e17f2cc63b872ece78203c01ef8d5f845820fe9a0fe43c4044a682a0f14489a4dabc94efdbf2838cff255911b059baf53511050e6a02fde2475ca919e313a6bb5cafe8ed3b61651c8cc6ff939f88c36c11b805d6530f845820feaa00b17cb389f0dbc9f65d22255b82a0c440f6033f2cc5ec0deff11da3e2e515d14a01ba420aa515ac311812724a441e3f772b19536735ced7a0d989c50063d73aa58f845820fe9a0dc7fac293ee42ef4f113414bc391b8f976c95e10ff364a74a4564b8c9bd6af7aa04e0513eb4ee7359d631be46f8b7f44c0049b9f4752565b1978fcd2260fc8103d94294f5bc8fadbd1079b191d9c47e1f217d6c987b4f847f845820feaa0409bdfe4239de15901ca37e54ab632a95cbced6a17ff85203d5c15ae140405f9a0464cd266e2a207589508d9d6241e93fe637476e8562e755c4d133875d7afe0dc'
    }
    {
        const testAddress = '0x5c525570f2b8e7e25f3a6b5e17f2cc63b872ece7'
        const pubArray = [
            '0xabbd10c55f629098d594b5c2b2967198bc5eccdf20a35e4e9c2896b0db6c7a8d1255629bc54d3e52ddfd16202e1820034630c8a2c2a0d4a1561aa1a9a1a9cb2b',
            '0x1f1d4186a795070bc519c7e297eed00d466106718a8e68abe43d37e65da0254f5968d5f789284099e11fd65b300c97ff6df543ba9b212f18a71e17adf8fbcdeb',
            '0x1ec395b3de087980e4a6ae2cb6e9d1acb469c0e54577267f2c4a5b4809f9d9118b691c79b8b5a1d07ececa6cfe5c8be0ebd622f240558bd776e4e73fbc57932d',
        ]
        const options = new caver.account.weightedMultiSigOptions(2, [1, 2, 3])
        const account = caver.account.createWithAccountKeyWeightedMultiSig(testAddress, pubArray, options)

        const tx = {
            from: testAddress,
            account,
            gas: '0x55730',
            nonce: '0x2',
            gasPrice: '0x5d21dba00',
            feeRatio: 30,
            signatures: [
                [
                    '0x0fe9',
                    '0xc1d45ae52a2de256d3da5086ab7769bccc3611243fdf3b1d0186617e3c782df7',
                    '0x26fcae8a34404ecc1e21a1a1a749c40cf667add4dc99986064d6097a95a59031',
                ],
            ],
            feePayer: '0x294f5bc8fadbd1079b191d9c47e1f217d6c987b4',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0x1b14fdbc76f6870943ebef563092324ef8743bf8ee5a7c76fe3faa2d60f74624',
                    '0x707502cd4225aa08f4990c5a564152ec55724d8ce4ea497ac1885c6791432899',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.MULTISIG].tx = tx
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingForSigning =
            '0xf89fb898f89622028505d21dba0083055730945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b87204f86f02f86ce301a103abbd10c55f629098d594b5c2b2967198bc5eccdf20a35e4e9c2896b0db6c7a8de302a1031f1d4186a795070bc519c7e297eed00d466106718a8e68abe43d37e65da0254fe303a1031ec395b3de087980e4a6ae2cb6e9d1acb469c0e54577267f2c4a5b4809f9d9111e8207e38080'

        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingForFeePayerSigning =
            '0xf8b4b898f89622028505d21dba0083055730945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b87204f86f02f86ce301a103abbd10c55f629098d594b5c2b2967198bc5eccdf20a35e4e9c2896b0db6c7a8de302a1031f1d4186a795070bc519c7e297eed00d466106718a8e68abe43d37e65da0254fe303a1031ec395b3de087980e4a6ae2cb6e9d1acb469c0e54577267f2c4a5b4809f9d9111e94294f5bc8fadbd1079b191d9c47e1f217d6c987b48207e38080'
        expectedValues[accountKeyTestCases.MULTISIG].senderTxHash = '0x083d4a460b19988a34dfc1e3e458df84e2c97c8693389a13931a4c740746b746'
        expectedValues[accountKeyTestCases.MULTISIG].transactionHash = '0x797a418893c6f3ac0cad2284707b716ef826e5fd09c5c1a5efddff897acefb1d'
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncoding =
            '0x22f9013c028505d21dba0083055730945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b87204f86f02f86ce301a103abbd10c55f629098d594b5c2b2967198bc5eccdf20a35e4e9c2896b0db6c7a8de302a1031f1d4186a795070bc519c7e297eed00d466106718a8e68abe43d37e65da0254fe303a1031ec395b3de087980e4a6ae2cb6e9d1acb469c0e54577267f2c4a5b4809f9d9111ef847f845820fe9a0c1d45ae52a2de256d3da5086ab7769bccc3611243fdf3b1d0186617e3c782df7a026fcae8a34404ecc1e21a1a1a749c40cf667add4dc99986064d6097a95a5903194294f5bc8fadbd1079b191d9c47e1f217d6c987b4f847f845820feaa01b14fdbc76f6870943ebef563092324ef8743bf8ee5a7c76fe3faa2d60f74624a0707502cd4225aa08f4990c5a564152ec55724d8ce4ea497ac1885c6791432899'
    }
    {
        const testAddress = '0x5c525570f2b8e7e25f3a6b5e17f2cc63b872ece7'
        const pubArray = [
            [
                '0x82d11080d64faed9b9cc0e50664175012d43491d430ed1c0c6d1e610c71155a9ec310c868f6873c539507602fd5df5a80e09c9a0b541d408fbdbc89553329c4b',
                '0xc4a93d90ae50bb1234230b419ea3dcbb196d4619c36cacb1d6494d10832441b9902d8e67b22dd07fc561c07178edde33fe2554661d8c75af20058a2689b82d30',
                '0xe7deb2e2b19c1fdb21163d7a3d4e861cdd59fa3df0e0e04420b8173b2545e546e979e26799a016d3f19e86601954e1609226297dd19b735a9e567ff76a4f3499',
            ],
            [
                '0xfc08c1f60bd819090a710397d008f7fe9484d434d61d156074591ab1f8bce6b779432d7e744314e7204a68b6d2827e43ad8cbb7f819c0681d0581217e15ba654',
                '0x281f3ae3b67ff556052338e27d9f9ce1d0175cce78b45b98338123a4baa0d2bd5815a4691b39ed893b943f8b2ed3104e3c5d09873df7ef9859070cc1c43b27e1',
                '0xd347eec75998b6b5ac6cc9bb77a771a292c533fb043464462f9c37e9f3a84760de8d916eae476155bb09e51a63d557f46a259f6c4b0874acf58e362a1f59979a',
            ],
            [
                '0x748d779bc3b06f83eb28636e6ab98838cb4b2ceb0c066ec6b5f3161a8f242e82374d599dd1f5296bf42404018fc2c4095cd2046aa7cfd8c11de1376ab1b26e6b',
                '0x9e9c3e95386e71835a839c504e19b3ed36d1aff87892b6414b513525f6bd6a422685708d591fe8dc3b410459b90bf74cfbb5fffff26eebc4733aeca45a101536',
                '0x1d965ec526e1d588d40b9c99fefa4763f2cebde74103a300778cb7c212474b49f88760495cb258441b19a8fd130aafc4ddc9d0786ab2922272c5f6b0501805a6',
            ],
        ]
        const account = caver.account.createWithAccountKeyRoleBased(testAddress, pubArray)

        const transactionWithRolebased = {
            from: testAddress,
            account,
            gas: '0x61a80',
            nonce: '0x3',
            gasPrice: '0x5d21dba00',
            feeRatio: 30,
            signatures: [
                [
                    '0x0fea',
                    '0xa2a8fe5dc3e5c6d01cde5b11ddd6a9fd8c419c4aa96100162f50e307660979b6',
                    '0x0e22cdfc93744a70403299e497618b8102f03a34773987ad80ae454fc8f97287',
                ],
                [
                    '0x0fea',
                    '0x48d6e5567961fd86fd8cdbd46a81eec5336c76772d6644cb944eb995959af521',
                    '0x306064709347bc74177595e6f48fbe8665fe6772cdaff4885f640dbb4a820161',
                ],
                [
                    '0x0fe9',
                    '0x0e335413896be3f75f9accbfee2a99b825a33d2513893d6ade0b18105d110245',
                    '0x085cfd94bd82c916ddcac4ca41b51d691b48073fa840752c166e470a9db9f7e9',
                ],
            ],
            feePayer: '0x294f5bc8fadbd1079b191d9c47e1f217d6c987b4',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0x7a8af8836035be491b86719c270375ddc1cefc2bcf19f2dfcd00e54173096e86',
                    '0x79d079ba796d28d24168a5eb10556620cc2a222f35691d19ed6ed85c245ffb8f',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.ROLEBAED].tx = transactionWithRolebased
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingForSigning =
            '0xf90190b90188f9018522038505d21dba0083061a80945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b9016005f9015cb87204f86f01f86ce301a10382d11080d64faed9b9cc0e50664175012d43491d430ed1c0c6d1e610c71155a9e301a102c4a93d90ae50bb1234230b419ea3dcbb196d4619c36cacb1d6494d10832441b9e301a103e7deb2e2b19c1fdb21163d7a3d4e861cdd59fa3df0e0e04420b8173b2545e546b87204f86f01f86ce301a102fc08c1f60bd819090a710397d008f7fe9484d434d61d156074591ab1f8bce6b7e301a103281f3ae3b67ff556052338e27d9f9ce1d0175cce78b45b98338123a4baa0d2bde301a102d347eec75998b6b5ac6cc9bb77a771a292c533fb043464462f9c37e9f3a84760b87204f86f01f86ce301a103748d779bc3b06f83eb28636e6ab98838cb4b2ceb0c066ec6b5f3161a8f242e82e301a1029e9c3e95386e71835a839c504e19b3ed36d1aff87892b6414b513525f6bd6a42e301a1021d965ec526e1d588d40b9c99fefa4763f2cebde74103a300778cb7c212474b491e8207e38080'

        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingForFeePayerSigning =
            '0xf901a5b90188f9018522038505d21dba0083061a80945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b9016005f9015cb87204f86f01f86ce301a10382d11080d64faed9b9cc0e50664175012d43491d430ed1c0c6d1e610c71155a9e301a102c4a93d90ae50bb1234230b419ea3dcbb196d4619c36cacb1d6494d10832441b9e301a103e7deb2e2b19c1fdb21163d7a3d4e861cdd59fa3df0e0e04420b8173b2545e546b87204f86f01f86ce301a102fc08c1f60bd819090a710397d008f7fe9484d434d61d156074591ab1f8bce6b7e301a103281f3ae3b67ff556052338e27d9f9ce1d0175cce78b45b98338123a4baa0d2bde301a102d347eec75998b6b5ac6cc9bb77a771a292c533fb043464462f9c37e9f3a84760b87204f86f01f86ce301a103748d779bc3b06f83eb28636e6ab98838cb4b2ceb0c066ec6b5f3161a8f242e82e301a1029e9c3e95386e71835a839c504e19b3ed36d1aff87892b6414b513525f6bd6a42e301a1021d965ec526e1d588d40b9c99fefa4763f2cebde74103a300778cb7c212474b491e94294f5bc8fadbd1079b191d9c47e1f217d6c987b48207e38080'
        expectedValues[accountKeyTestCases.ROLEBAED].senderTxHash = '0x14e68510db84f82075fa367bbd4dada2b1024cb985fce70b4ae72ee9cc421b2a'
        expectedValues[accountKeyTestCases.ROLEBAED].transactionHash = '0xd6f78a65f3de0dc2e4974a739bec097e54543c68beb5106bb1fc24d4290ec318'
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncoding =
            '0x22f902b9038505d21dba0083061a80945c525570f2b8e7e25f3a6b5e17f2cc63b872ece7b9016005f9015cb87204f86f01f86ce301a10382d11080d64faed9b9cc0e50664175012d43491d430ed1c0c6d1e610c71155a9e301a102c4a93d90ae50bb1234230b419ea3dcbb196d4619c36cacb1d6494d10832441b9e301a103e7deb2e2b19c1fdb21163d7a3d4e861cdd59fa3df0e0e04420b8173b2545e546b87204f86f01f86ce301a102fc08c1f60bd819090a710397d008f7fe9484d434d61d156074591ab1f8bce6b7e301a103281f3ae3b67ff556052338e27d9f9ce1d0175cce78b45b98338123a4baa0d2bde301a102d347eec75998b6b5ac6cc9bb77a771a292c533fb043464462f9c37e9f3a84760b87204f86f01f86ce301a103748d779bc3b06f83eb28636e6ab98838cb4b2ceb0c066ec6b5f3161a8f242e82e301a1029e9c3e95386e71835a839c504e19b3ed36d1aff87892b6414b513525f6bd6a42e301a1021d965ec526e1d588d40b9c99fefa4763f2cebde74103a300778cb7c212474b491ef8d5f845820feaa0a2a8fe5dc3e5c6d01cde5b11ddd6a9fd8c419c4aa96100162f50e307660979b6a00e22cdfc93744a70403299e497618b8102f03a34773987ad80ae454fc8f97287f845820feaa048d6e5567961fd86fd8cdbd46a81eec5336c76772d6644cb944eb995959af521a0306064709347bc74177595e6f48fbe8665fe6772cdaff4885f640dbb4a820161f845820fe9a00e335413896be3f75f9accbfee2a99b825a33d2513893d6ade0b18105d110245a0085cfd94bd82c916ddcac4ca41b51d691b48073fa840752c166e470a9db9f7e994294f5bc8fadbd1079b191d9c47e1f217d6c987b4f847f845820feaa07a8af8836035be491b86719c270375ddc1cefc2bcf19f2dfcd00e54173096e86a079d079ba796d28d24168a5eb10556620cc2a222f35691d19ed6ed85c245ffb8f'
    }
}

before(() => {
    caver = new Caver(testRPCURL)

    sender = caver.wallet.add(caver.wallet.keyring.generate())
    feePayer = caver.wallet.add(caver.wallet.keyring.generate())
    roleBasedKeyring = generateRoleBasedKeyring([3, 3, 3])

    const commonObj = {
        from: sender.address,
        gas: '0x3b9ac9ff',
        feePayer: feePayer.address,
        feeRatio: 30,
    }

    txObjWithLegacy = { account: makeAccount(sender.address, accountKeyTestCases.LEGACY), ...commonObj }
    txObjWithPublic = { account: makeAccount(sender.address, accountKeyTestCases.PUBLIC), ...commonObj }
    txObjWithFail = { account: makeAccount(sender.address, accountKeyTestCases.FAIL), ...commonObj }
    txObjWithMultiSig = { account: makeAccount(sender.address, accountKeyTestCases.MULTISIG), ...commonObj }
    txObjWithRoleBased = {
        account: makeAccount(sender.address, accountKeyTestCases.ROLEBAED, [
            { threshold: 2, weights: [1, 1, 1] },
            {},
            { threshold: 1, weights: [1, 1] },
        ]),
        ...commonObj,
    }

    makeAccountUpdateObjectWithExpectedValues()
})

describe('TxTypeFeeDelegatedAccountUpdateWithRatio', () => {
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy

    beforeEach(() => {
        txsByAccountKeys = []
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdateWithRatio.create(txObjWithLegacy))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdateWithRatio.create(txObjWithPublic))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdateWithRatio.create(txObjWithFail))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdateWithRatio.create(txObjWithMultiSig))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdateWithRatio.create(txObjWithRoleBased))

        getGasPriceSpy = sandbox.stub(caver.transaction.klaytnCall, 'getGasPrice')
        getGasPriceSpy.returns('0x5d21dba00')
        getNonceSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionCount')
        getNonceSpy.returns('0x3a')
        getChainIdSpy = sandbox.stub(caver.transaction.klaytnCall, 'getChainId')
        getChainIdSpy.returns('0x7e3')
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('create feeDelegatedAccountUpdateWithRatio instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-152: If feeDelegatedAccountUpdateWithRatio not define from, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-153: If feeDelegatedAccountUpdateWithRatio not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-154: If accountUpdate not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.account

            const expectedError = 'Missing account information with TxTypeFeeDelegatedAccountUpdateWithRatio transaction'
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-155: If feeDelegatedAccountUpdateWithRatio not define feeRatio, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.feeRatio

            const expectedError = '"feeRatio" is missing'
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-156: If feeDelegatedAccountUpdateWithRatio define from property with invalid address, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${testUpdateObj.from}`
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-157: If feeDelegatedAccountUpdateWithRatio define feePayer property with invalid address, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${testUpdateObj.feePayer}`
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-521: If feeDelegatedAccountUpdateWithRatio define feeRatio property with invalid value, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }

            testUpdateObj.feeRatio = 'nonHexString'
            let expectedError = `Invalid type fo feeRatio: feeRatio should be number type or hex number string.`
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = {}
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = []
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = 0
            expectedError = `Invalid feeRatio: feeRatio is out of range. [1, 99]`
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = 100
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = -1
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feeRatio = 101
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-158: If feeDelegatedAccountUpdateWithRatio define feePayerSignatures property without feePayer, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.feePayer = '0x'
            testUpdateObj.feePayerSignatures = [
                [
                    '0x26',
                    '0xf45cf8d7f88c08e6b6ec0b3b562f34ca94283e4689021987abb6b0772ddfd80a',
                    '0x298fe2c5aeabb6a518f4cbb5ff39631a5d88be505d3923374f65fdcf63c2955b',
                ],
            ]

            const expectedError = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'
            expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-159: If feeDelegatedAccountUpdateWithRatio define unnecessary property, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }

            const unnecessaries = [
                propertiesForUnnecessary.data,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.key,
                propertiesForUnnecessary.legacyKey,
                propertiesForUnnecessary.publicKey,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.multisig,
                propertiesForUnnecessary.roleTransactionKey,
                propertiesForUnnecessary.roleAccountUpdateKey,
                propertiesForUnnecessary.roleFeePayerKey,
                propertiesForUnnecessary.humanReadable,
                propertiesForUnnecessary.accessList,
                propertiesForUnnecessary.maxPriorityFeePerGas,
                propertiesForUnnecessary.maxFeePerGas,
            ]

            for (let i = 0; i < unnecessaries.length; i++) {
                if (i > 0) delete testUpdateObj[unnecessaries[i - 1].name]
                testUpdateObj[unnecessaries[i].name] = unnecessaries[i].value

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedAccountUpdateWithRatio} transaction`
                expect(() => caver.transaction.feeDelegatedAccountUpdateWithRatio.create(testUpdateObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-160: returns RLP-encoded string.', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                expect(tx.getRLPEncoding()).to.equal(expectedValues[i].rlpEncoding)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-161: getRLPEncoding should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-162: getRLPEncoding should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.sign', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let senderSignSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignSpy = sandbox.spy(sender, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTIONFDR-164: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-165: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.key.privateKey)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-166: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-167: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring, 1)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 1, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-168: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx, { expectedLength: roleBasedKeyring.roleAccountUpdateKey.length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-169: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring, 1, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx)
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-170: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-171: input: rolebased keyring, index out of range. should throw error.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
                await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.signAsFeePayer', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let feePayerSignSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendFeePayerSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            feePayerSignSpy = sandbox.spy(feePayer, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForFeePayerSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTIONFDR-172: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = '0x'
                await tx.signAsFeePayer(feePayer)

                expect(tx.feePayer.toLowerCase()).to.equal(feePayer.address.toLowerCase())
                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-173: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-174: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer.key.privateKey)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-175: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-176: input: keyring, index. should sign transaction with specific index.', async () => {
            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                await tx.signAsFeePayer(roleBasedKeyring, 1)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(roleBasedSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-177: input: keyring, custom hasher. should use custom hasher.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                await tx.signAsFeePayer(roleBasedKeyring, customHasher)

                checkFunctionCall(i, true)
                checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.roleFeePayerKey.length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-178: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                await tx.signAsFeePayer(roleBasedKeyring, 1, customHasher)

                checkFunctionCall(i, true)
                checkFeePayerSignature(tx)
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2, 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-179: input: keyring. should throw error when feePayer is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
                await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-180: input: rolebased keyring, index out of range. should throw error.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
                await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdateWithRatio.sign with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let senderSignWithKeysSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            senderSignWithKeysSpy = sandbox.spy(sender, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTIONFDR-181: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-182: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.key.privateKey)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-183: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-184: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender, customHasher)

                checkFunctionCall(i, true)
                checkSignature(tx)
                expect(senderSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-185: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address
                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-186: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                await tx.sign(roleBasedKeyring)

                checkFunctionCall(i, true)
                checkSignature(tx, { expectedLength: roleBasedKeyring.keys[0].length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdateWithRatio.signAsFeePayer with multiple keys', () => {
        const txHash = '0xe9a11d9ef95fb437f75d07ce768d43e74f158dd54b106e7d3746ce29d545b550'

        const fillTransactionSpys = []
        const appendSignaturesSpys = []

        let createFromPrivateKeySpy
        let feePayerSignWithKeysSpy
        let hasherSpy

        beforeEach(() => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                fillTransactionSpys.push(sandbox.spy(txsByAccountKeys[i], 'fillTransaction'))
                appendSignaturesSpys.push(sandbox.spy(txsByAccountKeys[i], 'appendFeePayerSignatures'))
            }

            createFromPrivateKeySpy = sandbox.spy(Keyring, 'createFromPrivateKey')
            feePayerSignWithKeysSpy = sandbox.spy(feePayer, 'sign')
            hasherSpy = sandbox.stub(TransactionHasher, 'getHashForFeePayerSignature')
            hasherSpy.returns(txHash)
        })

        afterEach(() => {
            sandbox.restore()
        })

        function checkFunctionCall(idx, customHasher = false) {
            expect(fillTransactionSpys[idx]).to.have.been.calledOnce
            expect(appendSignaturesSpys[idx]).to.have.been.calledOnce
            if (!customHasher) expect(hasherSpy).to.have.been.calledWith(txsByAccountKeys[idx])
        }

        it('CAVERJS-UNIT-TRANSACTIONFDR-187: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = '0x'
                await tx.signAsFeePayer(feePayer)

                expect(tx.feePayer.toLowerCase()).to.equal(feePayer.address.toLowerCase())
                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-188: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-189: input: private key string. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer.key.privateKey)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-190: input: KlaytnWalletKey. should sign transaction.', async () => {
            const signProtoSpy = sandbox.spy(SingleKeyring.prototype, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer.getKlaytnWalletKey())

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(signProtoSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).to.have.been.callCount(Object.keys(txsByAccountKeys).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-191: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
            const hashForCustomHasher = '0x9e4b4835f6ea5ce55bd1037fe92040dd070af6154aefc30d32c65364a1123cae'
            const customHasher = () => hashForCustomHasher

            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')

            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                await tx.signAsFeePayer(roleBasedKeyring, customHasher)

                checkFunctionCall(i, true)
                checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[caver.wallet.keyring.role.roleFeePayerKey].length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(hashForCustomHasher, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-192: input: keyring. should throw error when feePayer is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
                await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-193: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
            const roleBasedSignWithKeysSpy = sandbox.spy(roleBasedKeyring, 'sign')
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                await tx.signAsFeePayer(roleBasedKeyring)

                checkFunctionCall(i, true)
                checkFeePayerSignature(tx, { expectedLength: roleBasedKeyring.keys[2].length })
                expect(createFromPrivateKeySpy).not.to.have.been.calledOnce
                expect(roleBasedSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdateWithRatio.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-194: If signatures is empty, appendSignatures append signatures in transaction', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]
                tx.appendSignatures(sig)
                checkSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-195: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    [
                        '0x0fea',
                        '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                        '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                    ],
                ]
                tx.appendSignatures(sig)
                checkSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-196: If signatures is not empty, appendSignatures should append signatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.signatures = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]

                const sig = [
                    '0x0fea',
                    '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                    '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
                ]

                tx.appendSignatures(sig)
                checkSignature(tx, { expectedLength: 2 })
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-197: appendSignatures should append multiple signatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    [
                        '0x0fea',
                        '0xbde66cceed35a576010966338b7ded961f2c160c96f928e193b47aaf4480aa07',
                        '0x546eb193ec138523b7fd34c4f12a1a04d0f74470e8f3bbe91ce0b4ec16e7f0d2',
                    ],
                    [
                        '0x0fea',
                        '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                        '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                    ],
                ]

                tx.appendSignatures(sig)
                checkSignature(tx, { expectedLength: 2 })
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.appendFeePayerSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-198: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]
                tx.appendFeePayerSignatures(sig)
                checkFeePayerSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-199: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    [
                        '0x0fea',
                        '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                        '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                    ],
                ]
                tx.appendFeePayerSignatures(sig)
                checkFeePayerSignature(tx)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-200: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayerSignatures = [
                    '0x0fea',
                    '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                    '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                ]

                const sig = [
                    '0x0fea',
                    '0x7a5011b41cfcb6270af1b5f8aeac8aeabb1edb436f028261b5add564de694700',
                    '0x23ac51660b8b421bf732ef8148d0d4f19d5e29cb97be6bccb5ae505ebe89eb4a',
                ]

                tx.appendFeePayerSignatures(sig)
                checkFeePayerSignature(tx, { expectedLength: 2 })
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-201: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]

                const sig = [
                    [
                        '0x0fea',
                        '0xbde66cceed35a576010966338b7ded961f2c160c96f928e193b47aaf4480aa07',
                        '0x546eb193ec138523b7fd34c4f12a1a04d0f74470e8f3bbe91ce0b4ec16e7f0d2',
                    ],
                    [
                        '0x0fea',
                        '0xade9480f584fe481bf070ab758ecc010afa15debc33e1bd75af637d834073a6e',
                        '0x38160105d78cef4529d765941ad6637d8dcf6bd99310e165fee1c39fff2aa27e',
                    ],
                ]

                tx.appendFeePayerSignatures(sig)
                checkFeePayerSignature(tx, { expectedLength: 2 })
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.combineSignedRawTransactions', () => {
        let combinedTarget
        beforeEach(() => {
            const testAddress = '0x610a4bf32905c1dc6e5e61c37165b9aa3a718908'
            combinedTarget = {
                from: testAddress,
                gas: '0x186a0',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                feeRatio: 30,
                chainId: '0x7e3',
                account: caver.account.createWithAccountKeyLegacy(testAddress),
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-202: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x22f887018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef847f845820feaa03f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188a03e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e940000000000000000000000000000000000000000c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x3f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188',
                    '0x3e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-203: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            combinedTarget.signatures = [
                [
                    '0x0fea',
                    '0x3f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188',
                    '0x3e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e',
                ],
            ]
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)

            const rlpEncodedStrings = [
                '0x22f873018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef847f845820fe9a08094b2512daf27c211292cf2bdecca13733065070d5f61433a5d6702b864ee4aa02e86ee64c66859f8bc0b9c750c8b5ea0cc79a03cdbf9b78ca5db9c4ab6926b2580c4c3018080',
                '0x22f873018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef847f845820feaa034cda207b780c1defd54138f1d071f5d0e82160decf46c8d182f5f7aac341c32a003e174ed4357afebaa26c5c6c61c660c9bb130027d53f8cafb3a27f54273c3fd80c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x22f90115018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef8d5f845820feaa03f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188a03e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781ef845820fe9a08094b2512daf27c211292cf2bdecca13733065070d5f61433a5d6702b864ee4aa02e86ee64c66859f8bc0b9c750c8b5ea0cc79a03cdbf9b78ca5db9c4ab6926b25f845820feaa034cda207b780c1defd54138f1d071f5d0e82160decf46c8d182f5f7aac341c32a003e174ed4357afebaa26c5c6c61c660c9bb130027d53f8cafb3a27f54273c3fd940000000000000000000000000000000000000000c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x3f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188',
                    '0x3e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e',
                ],
                [
                    '0x0fe9',
                    '0x8094b2512daf27c211292cf2bdecca13733065070d5f61433a5d6702b864ee4a',
                    '0x2e86ee64c66859f8bc0b9c750c8b5ea0cc79a03cdbf9b78ca5db9c4ab6926b25',
                ],
                [
                    '0x0fea',
                    '0x34cda207b780c1defd54138f1d071f5d0e82160decf46c8d182f5f7aac341c32',
                    '0x03e174ed4357afebaa26c5c6c61c660c9bb130027d53f8cafb3a27f54273c3fd',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-204: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            combinedTarget.feePayer = '0xa317526534d82b902e86c960e037ede7b83af824'
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x22f887018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ec4c301808094a317526534d82b902e86c960e037ede7b83af824f847f845820fe9a071487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9a04d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x71487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9',
                    '0x4d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-205: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            combinedTarget.feePayer = '0xa317526534d82b902e86c960e037ede7b83af824'
            combinedTarget.feePayerSignatures = [
                [
                    '0x0fe9',
                    '0x71487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9',
                    '0x4d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2',
                ],
            ]
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)

            const rlpEncodedStrings = [
                '0x22f887018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ec4c301808094a317526534d82b902e86c960e037ede7b83af824f847f845820fe9a0d7e460da9cd48d780a71a8005b0bb5a6d6009786af55151f3388e42499b70e37a078643c2eca2711a2f776d9558fc2d8cf1a2f905647bbb0ffbab34b046ba9a141',
                '0x22f887018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ec4c301808094a317526534d82b902e86c960e037ede7b83af824f847f845820fe9a03a8484bbfde6d139cc886e9a253648f50b5b435f1049725f1e52da8f2b3ca765a004149af877984cfd0f3756b7e46ea8dd6a5f47de504c852d607adbdb67fa17fa',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x22f90115018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ec4c301808094a317526534d82b902e86c960e037ede7b83af824f8d5f845820fe9a071487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9a04d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2f845820fe9a0d7e460da9cd48d780a71a8005b0bb5a6d6009786af55151f3388e42499b70e37a078643c2eca2711a2f776d9558fc2d8cf1a2f905647bbb0ffbab34b046ba9a141f845820fe9a03a8484bbfde6d139cc886e9a253648f50b5b435f1049725f1e52da8f2b3ca765a004149af877984cfd0f3756b7e46ea8dd6a5f47de504c852d607adbdb67fa17fa'

            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0x71487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9',
                    '0x4d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2',
                ],
                [
                    '0x0fe9',
                    '0xd7e460da9cd48d780a71a8005b0bb5a6d6009786af55151f3388e42499b70e37',
                    '0x78643c2eca2711a2f776d9558fc2d8cf1a2f905647bbb0ffbab34b046ba9a141',
                ],
                [
                    '0x0fe9',
                    '0x3a8484bbfde6d139cc886e9a253648f50b5b435f1049725f1e52da8f2b3ca765',
                    '0x04149af877984cfd0f3756b7e46ea8dd6a5f47de504c852d607adbdb67fa17fa',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-206: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x22f90101018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef8d5f845820feaa03f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188a03e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781ef845820fe9a08094b2512daf27c211292cf2bdecca13733065070d5f61433a5d6702b864ee4aa02e86ee64c66859f8bc0b9c750c8b5ea0cc79a03cdbf9b78ca5db9c4ab6926b25f845820feaa034cda207b780c1defd54138f1d071f5d0e82160decf46c8d182f5f7aac341c32a003e174ed4357afebaa26c5c6c61c660c9bb130027d53f8cafb3a27f54273c3fd80c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x3f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188',
                    '0x3e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e',
                ],
                [
                    '0x0fe9',
                    '0x8094b2512daf27c211292cf2bdecca13733065070d5f61433a5d6702b864ee4a',
                    '0x2e86ee64c66859f8bc0b9c750c8b5ea0cc79a03cdbf9b78ca5db9c4ab6926b25',
                ],
                [
                    '0x0fea',
                    '0x34cda207b780c1defd54138f1d071f5d0e82160decf46c8d182f5f7aac341c32',
                    '0x03e174ed4357afebaa26c5c6c61c660c9bb130027d53f8cafb3a27f54273c3fd',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x22f90115018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ec4c301808094a317526534d82b902e86c960e037ede7b83af824f8d5f845820fe9a071487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9a04d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2f845820fe9a0d7e460da9cd48d780a71a8005b0bb5a6d6009786af55151f3388e42499b70e37a078643c2eca2711a2f776d9558fc2d8cf1a2f905647bbb0ffbab34b046ba9a141f845820fe9a03a8484bbfde6d139cc886e9a253648f50b5b435f1049725f1e52da8f2b3ca765a004149af877984cfd0f3756b7e46ea8dd6a5f47de504c852d607adbdb67fa17fa',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fe9',
                    '0x71487ff3f9d01d0bbec812339ff775a7129a0311b2039e8cbf113be48f2fa3d9',
                    '0x4d4d0bcb2c9e4468de70645a5a818d9304ec2f8c75497fa092eb3cc8e7fe94d2',
                ],
                [
                    '0x0fe9',
                    '0xd7e460da9cd48d780a71a8005b0bb5a6d6009786af55151f3388e42499b70e37',
                    '0x78643c2eca2711a2f776d9558fc2d8cf1a2f905647bbb0ffbab34b046ba9a141',
                ],
                [
                    '0x0fe9',
                    '0x3a8484bbfde6d139cc886e9a253648f50b5b435f1049725f1e52da8f2b3ca765',
                    '0x04149af877984cfd0f3756b7e46ea8dd6a5f47de504c852d607adbdb67fa17fa',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-207: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(combinedTarget)
            tx.nonce = 1234

            const rlpEncoded =
                '0x22f873018505d21dba00830186a094610a4bf32905c1dc6e5e61c37165b9aa3a7189088201c01ef847f845820feaa03f34007147ba1c9184d51b7dfacae768ae00c859b4726ef339502e98d44ec188a03e518e277769ba02d57c8c7fab291abab61e2525735500402e78a1493e48781e80c4c3018080'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-208: getRawTransaction should call getRLPEncoding function', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].rlpEncoding
                const rawTransaction = tx.getRawTransaction()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(rawTransaction).to.equal(expected)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-209: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].transactionHash
                const txHash = tx.getTransactionHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(txHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(txHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-210: getTransactionHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-211: getTransactionHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-213: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].senderTxHash
                const senderTxHash = tx.getSenderTxHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(senderTxHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-214: getSenderTxHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-215: getSenderTxHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-217: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

                const expected = expectedValues[i].rlpEncodingForSigning
                const rlpEncodingForSign = tx.getRLPEncodingForSignature()

                expect(rlpEncodingForSign).to.equal(expected)
                expect(commonRLPForSigningSpy).to.have.been.calledOnce
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-218: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-219: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFDR-220: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._chainId

                const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-221: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)

                const decoded = RLP.decode(expectedValues[i].rlpEncodingForSigning)
                const commonRLPForSign = tx.getCommonRLPEncodingForSignature()

                expect(commonRLPForSign).to.equal(decoded[0])
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-222: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._gasPrice

                await tx.fillTransaction()
                expect(getNonceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getGasPriceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-223: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._nonce

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getNonceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-224: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(expectedValues[i].tx)
                delete tx._chainId

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getNonceSpy).not.to.have.been.calledOnce
            }
            expect(getChainIdSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdateWithRatio.recoverPublicKeys feeDelegatedAccountUpdateWithRatio.recoverFeePayerPublicKeys', () => {
        // const privateKeys = [
        //     '0x6a1e0b0094e4d168aade69f1305e4d4c26c3c68fdbea4e2ebbcb3afc6d4cecba',
        //     '0xbb5be45662e3b95f468b5248ec18dfb5eae2c1b401277399e943614480cd35f3',
        //     '0xffd56f5237722773702cd559fadf46a7a994e5896ef76ec7282cf55ba6017181',
        // ]
        // const feePayerKeys = [
        //     '0x2ee1467444e4dca5b279014e898ab56da4c2b1ad012fa0d0856f3e3e115fedd2',
        //     '0x73d3d825a24624656f790a2c5ac1e29e227c19208fa0c89a2828f011db078d73',
        //     '0xa83a3afc73d18055a909973f6a126fe1506ba8a1c8bf7aad65d69ee3a6163a3f',
        // ]
        const expectedPublicKeyArray = [
            '0xfbda4ac2c04336609f7e5a363c71c1565b442d552b82cbd0e75bbabaf215fd28b69ce88a6b9f2a463f1420bd9a0992413254748a7ab46d5ba78d09b35cf0e912',
            '0xa234bd09ea829cb39dd2f5aced2318039f30ce5fe28f5eb28a256bac8617eb5db57ac7683fa21a01c8cbd2ca31c2cf93c97871c73896bf051f9bc0885c87ebe2',
            '0x6ed39def6b25fc001790d267922281483c372b5d2486ae955ece1f1b64b19aea85392c8555947a1c63577439afdb74c77ef07d50520435d31cf4afb3dfe0074f',
        ]
        const expectedFeePayerPublicKeyArray = [
            '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed3819f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
            '0x1a1cfe1e2ec4b15520c57c20c2460981a2f16003c8db11a0afc282abf929fa1c1868f60f91b330c423aa660913d86acc2a0b1b15e7ba1fe571e5928a19825a7e',
            '0xdea23a89dbbde1a0c26466c49c1edd32785432389641797038c2b53815cb5c73d6cf5355986fd9a22a68bb57b831857fd1636362b383bd632966392714b60d72',
        ]

        const txObj = {
            from: '0x07a9a76ef778676c3bd2b334edcf581db31a85e5',
            feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
            feeRatio: '0x63',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fea',
                    '0x8eb5dfc7e7a0684ec1bae214c2f8a2e1a02fa64c1f2130ebfd9a3b3a632c2c0b',
                    '0x5c6ade954838134af916afe64107a5503c98211803dd774e75d6a70390a11456',
                ],
                [
                    '0x0fea',
                    '0x29b764526dfdc63fbbf0c4ba5f11f4fa1eddfda78db3a7d24ae0088f1b615724',
                    '0x3e54b2d70e1723bebae9b4a9d5118ad0cb14dec97bce076a72551fa71901f7a0',
                ],
                [
                    '0x0fe9',
                    '0xea4aa6a30d0c10c904db4351c1b083b49f589ea86b535b038ee9cafefbe57d18',
                    '0x6ac7dc2d1de4ba51bab9dfd22ba566394683e2daef5e577bd36d78139bc10b00',
                ],
            ],
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0x0c29fc700f0fe2265411ceea1068998ea1d78f9c86fae43f29ae683747c07b42',
                    '0x481ef864d9ab6000e187bcd5a6b2f243465e28d08da282dd66dae2009c0284e5',
                ],
                [
                    '0x0fea',
                    '0xa175d60b8ad6b54d4e249c233a40c73d66fae599d440e244a8ba2cd0252b30df',
                    '0x0ffa68e1c8a2060af56e0a2962fab6235233b28bb473745b2fc8c0bc1b02136a',
                ],
                [
                    '0x0fea',
                    '0xcc6ba796398975803dc0e34ddaa2f01346f3fd9da494fe98170507a0f573d085',
                    '0x2930d6972c4fe3b09f36a5e4921424c23396d679082b4e48d87de4e5352b2bab',
                ],
            ],
        }

        it('CAVERJS-UNIT-TRANSACTIONFDR-539: should return public key string recovered from signatures in FeeDelegatedAccountUpdateWithRatio', async () => {
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create({
                account: caver.account.createWithAccountKeyLegacy(txObj.from),
                ...txObj,
            })
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFDR-540: should return fee payer public key string recovered from feePayerSignatures in FeeDelegatedAccountUpdateWithRatio', async () => {
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create({
                account: caver.account.createWithAccountKeyLegacy(txObj.from),
                ...txObj,
            })
            const publicKeys = tx.recoverFeePayerPublicKeys()

            expect(publicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdateWithRatio should encoding odd feeRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-558: should encode and decode correctly with feeDelegatedAccountUpdateWithRatio', async () => {
            const tx = caver.transaction.feeDelegatedAccountUpdateWithRatio.create({
                from: sender.address,
                feePayer: '0xb5db72925b1b6b79299a1a49ae226cd7861083ac',
                feeRatio: '0xa',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x0',
                gas: '0x2faf080',
                account: caver.account.createWithAccountKeyLegacy(sender.address),
            })
            await tx.sign(sender)
            const rawTx = tx.getRLPEncoding()
            const decoded = caver.transaction.decode(rawTx)

            expect(tx.feeRatio).to.equal(decoded.feeRatio)
        }).timeout(200000)
    })
})
