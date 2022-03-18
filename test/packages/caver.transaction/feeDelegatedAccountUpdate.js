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
        const testAddress = '0xac1aec09ef5f8dde6a0baf709ea388bbd7965f72'
        const account = caver.account.createWithAccountKeyLegacy(testAddress)

        const tx = {
            from: testAddress,
            account,
            gas: '0x493e0',
            nonce: '0x0',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0xd10f11309a670e133a408b7ebccf277e57af7d0701d5d811daec0dd8025ad961',
                    '0x123e6dc3ca7a3603de954297fdf3d308c7ecdd43023f61121394182316313f82',
                ],
            ],
            feePayer: '0x23bf3d4eb274621e56ce65f6fa05da9e24785bb8',
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0x6d13eff0efc972b0ecf89c65e502eda4f97ebbd5cbcedcaa99af0c063b0d59cf',
                    '0x4cc0be553bb13a4549eae8f2b140282e1baf29728ae118f2f575e53a25cc305b',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.LEGACY].tx = tx
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingForSigning =
            '0xeba5e421808505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728201c08207e38080'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncodingForFeePayerSigning =
            '0xf840a5e421808505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728201c09423bf3d4eb274621e56ce65f6fa05da9e24785bb88207e38080'
        expectedValues[accountKeyTestCases.LEGACY].senderTxHash = '0xed17e28df6ed7ad8ae1b7fb25e1a81ce03c5b145fd62ea2281c866bd1a39ba43'
        expectedValues[accountKeyTestCases.LEGACY].transactionHash = '0x4ef87ddc379e003ff736085cd98842c085712b3218402052e318e12da752f810'
        expectedValues[accountKeyTestCases.LEGACY].rlpEncoding =
            '0x21f8ca808505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728201c0f847f845820fe9a0d10f11309a670e133a408b7ebccf277e57af7d0701d5d811daec0dd8025ad961a0123e6dc3ca7a3603de954297fdf3d308c7ecdd43023f61121394182316313f829423bf3d4eb274621e56ce65f6fa05da9e24785bb8f847f845820fe9a06d13eff0efc972b0ecf89c65e502eda4f97ebbd5cbcedcaa99af0c063b0d59cfa04cc0be553bb13a4549eae8f2b140282e1baf29728ae118f2f575e53a25cc305b'
    }
    {
        const testAddress = '0xac1aec09ef5f8dde6a0baf709ea388bbd7965f72'
        const pubKey =
            '0xd032771e5d927fb568cdf7605496b700277d7b9bcabe7657f45602348964e3963e290efde1cb8d1204659548bd50824cfa4b4d5199c66dbcceb3fb8de7f8b5b9'
        const account = caver.account.createWithAccountKeyPublic(testAddress, pubKey)

        const tx = {
            from: testAddress,
            account,
            gas: '0x493e0',
            nonce: '0x1',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x0e1a3542288951226c66e6e8de320ddef4e0c0d6650baec828998a7ce411fe',
                    '0x52d0766f3b84f35787d2a810f97057d215dcbe070cd890b7ccb8aaa3aac8eacc',
                ],
            ],
            feePayer: '0x23bf3d4eb274621e56ce65f6fa05da9e24785bb8',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0xfaca4cf91418c6fea61e9439620b656c7b0717b058fd8787865f4564a0f9974e',
                    '0x3a483582435426e7b2aeffe3131a678ae54c7aa948fa5442b5ded209ba373221',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.PUBLIC].tx = tx
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingForSigning =
            '0xf84eb847f84521018505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f72a302a103d032771e5d927fb568cdf7605496b700277d7b9bcabe7657f45602348964e3968207e38080'
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncodingForFeePayerSigning =
            '0xf863b847f84521018505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f72a302a103d032771e5d927fb568cdf7605496b700277d7b9bcabe7657f45602348964e3969423bf3d4eb274621e56ce65f6fa05da9e24785bb88207e38080'
        expectedValues[accountKeyTestCases.PUBLIC].senderTxHash = '0x9fee61b7611d069477b9dec87f58cec7ef96d2559e441f7baf3f4468b3669784'
        expectedValues[accountKeyTestCases.PUBLIC].transactionHash = '0xe939f967e154f9d3400e9042fb9d0c58bcee914274d883aac8d2fe8aec8d56e9'
        expectedValues[accountKeyTestCases.PUBLIC].rlpEncoding =
            '0x21f8ea018505d21dba00830493e094ac1aec09ef5f8dde6a0baf709ea388bbd7965f72a302a103d032771e5d927fb568cdf7605496b700277d7b9bcabe7657f45602348964e396f846f844820fe99f0e1a3542288951226c66e6e8de320ddef4e0c0d6650baec828998a7ce411fea052d0766f3b84f35787d2a810f97057d215dcbe070cd890b7ccb8aaa3aac8eacc9423bf3d4eb274621e56ce65f6fa05da9e24785bb8f847f845820feaa0faca4cf91418c6fea61e9439620b656c7b0717b058fd8787865f4564a0f9974ea03a483582435426e7b2aeffe3131a678ae54c7aa948fa5442b5ded209ba373221'
    }
    {
        const testAddress = '0xac1aec09ef5f8dde6a0baf709ea388bbd7965f72'
        const account = caver.account.createWithAccountKeyFail(testAddress)

        const tx = {
            from: testAddress,
            account,
            gas: '0x186a0',
            nonce: '0x4',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fea',
                    '0x31115ed4fdf3cdc9c3071be0c14a992d1ca70b02382b3fadb2428a60f411edcb',
                    '0x33530406db890a6c144759f72977739edfe2f9718966de52d6dada0a70be27ae',
                ],
                [
                    '0x0fe9',
                    '0x2b50229dc8d4c18414d1f8f943658ca22e6c08a57f52e7e77910d01c1bb49286',
                    '0x795fc16b6327c41593eb9b7ea5bbf2c61e3b4b3e5cd3176d3ebd57007fa4842b',
                ],
                [
                    '0x0fea',
                    '0xd5e3d18cd12fb36180adad4df5b9f15089ac9f8448e7a7eeb0fc0f6497faa98d',
                    '0x246503976acea8e9a91e630963eaa344b193fc4e747c1ccaae253083d2695e96',
                ],
            ],
            feePayer: '0x23bf3d4eb274621e56ce65f6fa05da9e24785bb8',
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0x4dfc5650bf203652b440ba53791f0adc07c2fae0e746efbda2b5117c568474d3',
                    '0x72bea336107273fd0e1624d4f70425bb040e59e8f2b5d856fc22ab898c2b156e',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.FAIL].tx = tx
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingForSigning =
            '0xeba5e421048505d21dba00830186a094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728203c08207e38080'
        expectedValues[accountKeyTestCases.FAIL].rlpEncodingForFeePayerSigning =
            '0xf840a5e421048505d21dba00830186a094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728203c09423bf3d4eb274621e56ce65f6fa05da9e24785bb88207e38080'
        expectedValues[accountKeyTestCases.FAIL].senderTxHash = '0xed215e3932acb07b94a5b0482f48c04e76e41749f88bfddfa70c7fe2f6daa278'
        expectedValues[accountKeyTestCases.FAIL].transactionHash = '0xd8b8da94309ca9495d16e3d8e04df3a386ba338c5839bdcf8cee7f796b10e1a7'
        expectedValues[accountKeyTestCases.FAIL].rlpEncoding =
            '0x21f90158048505d21dba00830186a094ac1aec09ef5f8dde6a0baf709ea388bbd7965f728203c0f8d5f845820feaa031115ed4fdf3cdc9c3071be0c14a992d1ca70b02382b3fadb2428a60f411edcba033530406db890a6c144759f72977739edfe2f9718966de52d6dada0a70be27aef845820fe9a02b50229dc8d4c18414d1f8f943658ca22e6c08a57f52e7e77910d01c1bb49286a0795fc16b6327c41593eb9b7ea5bbf2c61e3b4b3e5cd3176d3ebd57007fa4842bf845820feaa0d5e3d18cd12fb36180adad4df5b9f15089ac9f8448e7a7eeb0fc0f6497faa98da0246503976acea8e9a91e630963eaa344b193fc4e747c1ccaae253083d2695e969423bf3d4eb274621e56ce65f6fa05da9e24785bb8f847f845820feaa04dfc5650bf203652b440ba53791f0adc07c2fae0e746efbda2b5117c568474d3a072bea336107273fd0e1624d4f70425bb040e59e8f2b5d856fc22ab898c2b156e'
    }
    {
        const testAddress = '0xed2f77b1962805385512c18ad6d66f3dee3def15'
        const pubArray = [
            '0xac1350e8b234a7dac087e4899d5b30687bd153d181faaf4ef11fea7d1acbecf45669b120fd488cf638f7ea83cfe009d85b949aacd51cde80e3162a17aa5160f7',
            '0x798096c2691444e7c579e04f13c6edeb122b9e35718c041a51b74ccd5f1a086f2e499900717c718a434b15a989d4c33bae18a65f4c1e6b48f8103478cf1e5ef5',
            '0xaeb9ab821099f4c5d80caafbc0d1980a1a1a701cab8cd0cca8e2f187263a992d5bbf8ea44a1f9bf577175fdccc953c8b8d1bbeeefdabd839be1fcf89f532f470',
        ]
        const options = new caver.account.weightedMultiSigOptions(2, [1, 2, 3])
        const account = caver.account.createWithAccountKeyWeightedMultiSig(testAddress, pubArray, options)

        const tx = {
            from: testAddress,
            account,
            gas: '0x55730',
            nonce: '0x2',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fe9',
                    '0x3665a7ef1b6bc74171c00cca93380e4a28ff01090a28b9e7f861ca5c01cc26ae',
                    '0x0bb148b53761c946bd154506317625aab8b910cf55185d16158e0fef67dd0a6c',
                ],
            ],
            feePayer: '0x23bf3d4eb274621e56ce65f6fa05da9e24785bb8',
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0xd0275ad7a55bf6b3f30c5cd27a2940ba574f05d9650e41f08dce929a1b7985b3',
                    '0x15576c4473dc7c42df9b1d9f106fbfc8a38646f4adca26f4a14a04ea5bd7351d',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.MULTISIG].tx = tx
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingForSigning =
            '0xf89eb897f89521028505d21dba008305573094ed2f77b1962805385512c18ad6d66f3dee3def15b87204f86f02f86ce301a103ac1350e8b234a7dac087e4899d5b30687bd153d181faaf4ef11fea7d1acbecf4e302a103798096c2691444e7c579e04f13c6edeb122b9e35718c041a51b74ccd5f1a086fe303a102aeb9ab821099f4c5d80caafbc0d1980a1a1a701cab8cd0cca8e2f187263a992d8207e38080'

        expectedValues[accountKeyTestCases.MULTISIG].rlpEncodingForFeePayerSigning =
            '0xf8b3b897f89521028505d21dba008305573094ed2f77b1962805385512c18ad6d66f3dee3def15b87204f86f02f86ce301a103ac1350e8b234a7dac087e4899d5b30687bd153d181faaf4ef11fea7d1acbecf4e302a103798096c2691444e7c579e04f13c6edeb122b9e35718c041a51b74ccd5f1a086fe303a102aeb9ab821099f4c5d80caafbc0d1980a1a1a701cab8cd0cca8e2f187263a992d9423bf3d4eb274621e56ce65f6fa05da9e24785bb88207e38080'
        expectedValues[accountKeyTestCases.MULTISIG].senderTxHash = '0x873f2a5f234a276c64a05c8036720db0c0dbf75770a137746952d925b6fff0a1'
        expectedValues[accountKeyTestCases.MULTISIG].transactionHash = '0xd2b7b5487b530e4ae3e164837cef3da078f4ba5ef6fbdafa4498edc83fb5ee45'
        expectedValues[accountKeyTestCases.MULTISIG].rlpEncoding =
            '0x21f9013b028505d21dba008305573094ed2f77b1962805385512c18ad6d66f3dee3def15b87204f86f02f86ce301a103ac1350e8b234a7dac087e4899d5b30687bd153d181faaf4ef11fea7d1acbecf4e302a103798096c2691444e7c579e04f13c6edeb122b9e35718c041a51b74ccd5f1a086fe303a102aeb9ab821099f4c5d80caafbc0d1980a1a1a701cab8cd0cca8e2f187263a992df847f845820fe9a03665a7ef1b6bc74171c00cca93380e4a28ff01090a28b9e7f861ca5c01cc26aea00bb148b53761c946bd154506317625aab8b910cf55185d16158e0fef67dd0a6c9423bf3d4eb274621e56ce65f6fa05da9e24785bb8f847f845820fe9a0d0275ad7a55bf6b3f30c5cd27a2940ba574f05d9650e41f08dce929a1b7985b3a015576c4473dc7c42df9b1d9f106fbfc8a38646f4adca26f4a14a04ea5bd7351d'
    }
    {
        const testAddress = '0xed2f77b1962805385512c18ad6d66f3dee3def15'
        const pubArray = [
            [
                '0xca112896b2025047790bbcc74f48af339f71390b5335b5e657b50ef8f634fb9fb4f7caf09ec53e8ec0d78253c37d30367631ac44c4b4825b9b5a7bfb6b55b5af',
                '0xec93c2f3990b61e692467cc2c49b9ff2f595002234c8116bae8807ff0236bd5e99e943b81be279230a218d297069099d873f49b12557ce6ac5bdeee8ddb83665',
                '0x99a40e6be991d48c9a5604059517cf489c77d35df64d1ff0233469ff27350652e907ed7a6e1662730d9d22a6b102e44b499dd271802452bd668229db0fc4750c',
            ],
            [
                '0xf890dfeca00111977dd6be8198466099ba6528e40403fe32a9994cd03ad18f3d24f3776a5e445b34b8654d9c56fe2397d8ed4989614dfefb776f038e024436ea',
                '0xfeedab225d4008d162e495fef4aba1b315369a140837d1150acecb71bb1c7faaef896b4a3e917824b18626fc86c2ab2f11307870a0ed2e72a2d8cfdaef5509bc',
                '0xfff2068f7ab4ae7faed86395647502ec6c8219eebe13858ddaaf01112bf40de6dfe82af9538d96465bf11d49d3d5d56b7868476bfb3a1d930177aa05b0345603',
            ],
            [
                '0x3a8547ed514797bac885e5aaf2d8ee7a5b3df542efdf28b3886bd5b925f5231c1f2e0d8c9fedae714a5bd71411cb0ec60d63246b04daeedd3ff4ccd1fc95ecc4',
                '0x13c45e4cbb231ba8150e5943a85a0ac9d6e7a347fcbc27833067e6ee0e63346dbf4c3e290296d9ea700f721b4f056582383be954b6a68525aae197a0f5813f73',
                '0xc45e5eb35215d1a945ef3790b4689e9644e0b14661bdb2f5d0e3bb1b729f091d054a3c972a93421ccb80e29b0af9ce0c0d7ec5f773b25d7769837114a339c935',
            ],
        ]
        const account = caver.account.createWithAccountKeyRoleBased(testAddress, pubArray)

        const transactionWithRolebased = {
            from: testAddress,
            account,
            gas: '0x61a80',
            nonce: '0x3',
            gasPrice: '0x5d21dba00',
            signatures: [
                [
                    '0x0fea',
                    '0xbedc71cfef422e80c32b752b4ebac9ee9e047f3beea07f1929b3f2543dddfd6d',
                    '0x5454e3c2164fb6b844ccf74e07ca8420d427a3ca0f2f15b20be6c285ba308f45',
                ],
                [
                    '0x0fea',
                    '0x66530029fde1835b844505657d15e6457e432744107c3111b998ce1e76a548f6',
                    '0x2b045a9959d522f738390f47a528045845896bf818e35355367e017bd1f41644',
                ],
                [
                    '0x0fea',
                    '0x15e210db2922121c4a8f1223149846844a1923212892acf66df0d0b3daab8b58',
                    '0x07680c111780bada54d62c62c8182984e92ec4817d59c313046d1f8030c001e7',
                ],
            ],
            feePayer: '0x23bf3d4eb274621e56ce65f6fa05da9e24785bb8',
            feePayerSignatures: [
                [
                    '0x0fe9',
                    '0x5801ee7887b401d34888d9141915c167c5bfce429d836c1acbc229b9c6938481',
                    '0x0f4c01747d3e5f6221063d7e74efc5c7d59020a74dce1c7e37e9a78d5d31de44',
                ],
            ],
            chainId: '0x7e3',
        }

        expectedValues.push({})
        expectedValues[accountKeyTestCases.ROLEBAED].tx = transactionWithRolebased
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingForSigning =
            '0xf9018fb90187f9018421038505d21dba0083061a8094ed2f77b1962805385512c18ad6d66f3dee3def15b9016005f9015cb87204f86f01f86ce301a103ca112896b2025047790bbcc74f48af339f71390b5335b5e657b50ef8f634fb9fe301a103ec93c2f3990b61e692467cc2c49b9ff2f595002234c8116bae8807ff0236bd5ee301a10299a40e6be991d48c9a5604059517cf489c77d35df64d1ff0233469ff27350652b87204f86f01f86ce301a102f890dfeca00111977dd6be8198466099ba6528e40403fe32a9994cd03ad18f3de301a102feedab225d4008d162e495fef4aba1b315369a140837d1150acecb71bb1c7faae301a103fff2068f7ab4ae7faed86395647502ec6c8219eebe13858ddaaf01112bf40de6b87204f86f01f86ce301a1023a8547ed514797bac885e5aaf2d8ee7a5b3df542efdf28b3886bd5b925f5231ce301a10313c45e4cbb231ba8150e5943a85a0ac9d6e7a347fcbc27833067e6ee0e63346de301a103c45e5eb35215d1a945ef3790b4689e9644e0b14661bdb2f5d0e3bb1b729f091d8207e38080'

        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncodingForFeePayerSigning =
            '0xf901a4b90187f9018421038505d21dba0083061a8094ed2f77b1962805385512c18ad6d66f3dee3def15b9016005f9015cb87204f86f01f86ce301a103ca112896b2025047790bbcc74f48af339f71390b5335b5e657b50ef8f634fb9fe301a103ec93c2f3990b61e692467cc2c49b9ff2f595002234c8116bae8807ff0236bd5ee301a10299a40e6be991d48c9a5604059517cf489c77d35df64d1ff0233469ff27350652b87204f86f01f86ce301a102f890dfeca00111977dd6be8198466099ba6528e40403fe32a9994cd03ad18f3de301a102feedab225d4008d162e495fef4aba1b315369a140837d1150acecb71bb1c7faae301a103fff2068f7ab4ae7faed86395647502ec6c8219eebe13858ddaaf01112bf40de6b87204f86f01f86ce301a1023a8547ed514797bac885e5aaf2d8ee7a5b3df542efdf28b3886bd5b925f5231ce301a10313c45e4cbb231ba8150e5943a85a0ac9d6e7a347fcbc27833067e6ee0e63346de301a103c45e5eb35215d1a945ef3790b4689e9644e0b14661bdb2f5d0e3bb1b729f091d9423bf3d4eb274621e56ce65f6fa05da9e24785bb88207e38080'
        expectedValues[accountKeyTestCases.ROLEBAED].senderTxHash = '0x21a6004af918a61c1f0b6420cb85b329ac65a5cca0a668d207cfd1796470313e'
        expectedValues[accountKeyTestCases.ROLEBAED].transactionHash = '0x73540a1b47ec1836dae7657cfb8a7e7ae3e7e5cc54fd33f58b9f7efca6d8692c'
        expectedValues[accountKeyTestCases.ROLEBAED].rlpEncoding =
            '0x21f902b8038505d21dba0083061a8094ed2f77b1962805385512c18ad6d66f3dee3def15b9016005f9015cb87204f86f01f86ce301a103ca112896b2025047790bbcc74f48af339f71390b5335b5e657b50ef8f634fb9fe301a103ec93c2f3990b61e692467cc2c49b9ff2f595002234c8116bae8807ff0236bd5ee301a10299a40e6be991d48c9a5604059517cf489c77d35df64d1ff0233469ff27350652b87204f86f01f86ce301a102f890dfeca00111977dd6be8198466099ba6528e40403fe32a9994cd03ad18f3de301a102feedab225d4008d162e495fef4aba1b315369a140837d1150acecb71bb1c7faae301a103fff2068f7ab4ae7faed86395647502ec6c8219eebe13858ddaaf01112bf40de6b87204f86f01f86ce301a1023a8547ed514797bac885e5aaf2d8ee7a5b3df542efdf28b3886bd5b925f5231ce301a10313c45e4cbb231ba8150e5943a85a0ac9d6e7a347fcbc27833067e6ee0e63346de301a103c45e5eb35215d1a945ef3790b4689e9644e0b14661bdb2f5d0e3bb1b729f091df8d5f845820feaa0bedc71cfef422e80c32b752b4ebac9ee9e047f3beea07f1929b3f2543dddfd6da05454e3c2164fb6b844ccf74e07ca8420d427a3ca0f2f15b20be6c285ba308f45f845820feaa066530029fde1835b844505657d15e6457e432744107c3111b998ce1e76a548f6a02b045a9959d522f738390f47a528045845896bf818e35355367e017bd1f41644f845820feaa015e210db2922121c4a8f1223149846844a1923212892acf66df0d0b3daab8b58a007680c111780bada54d62c62c8182984e92ec4817d59c313046d1f8030c001e79423bf3d4eb274621e56ce65f6fa05da9e24785bb8f847f845820fe9a05801ee7887b401d34888d9141915c167c5bfce429d836c1acbc229b9c6938481a00f4c01747d3e5f6221063d7e74efc5c7d59020a74dce1c7e37e9a78d5d31de44'
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

describe('TxTypeFeeDelegatedAccountUpdate', () => {
    let getGasPriceSpy
    let getNonceSpy
    let getChainIdSpy

    beforeEach(() => {
        txsByAccountKeys = []
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdate.create(txObjWithLegacy))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdate.create(txObjWithPublic))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdate.create(txObjWithFail))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdate.create(txObjWithMultiSig))
        txsByAccountKeys.push(caver.transaction.feeDelegatedAccountUpdate.create(txObjWithRoleBased))

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

    context('create feeDelegatedAccountUpdate instance', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-150: If feeDelegatedAccountUpdate not define from, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.from

            const expectedError = '"from" is missing'
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-151: If feeDelegatedAccountUpdate not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.gas

            const expectedError = '"gas" is missing'
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-152: If accountUpdate not define gas, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            delete testUpdateObj.account

            const expectedError = 'Missing account information with TxTypeFeeDelegatedAccountUpdate transaction'
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-153: If feeDelegatedAccountUpdate define from property with invalid address, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.from = 'invalid'

            const expectedError = `Invalid address of from: ${testUpdateObj.from}`
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-154: If feeDelegatedAccountUpdate define feePayer property with invalid address, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }
            testUpdateObj.feePayer = 'invalid'

            const expectedError = `Invalid address of fee payer: ${testUpdateObj.feePayer}`
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-155: If feeDelegatedAccountUpdate define feePayerSignatures property without feePayer, return error', () => {
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
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)

            testUpdateObj.feePayer = '0x0000000000000000000000000000000000000000'
            expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-156: If feeDelegatedAccountUpdate define unnecessary property, return error', () => {
            const testUpdateObj = { ...txObjWithPublic }

            const unnecessaries = [
                propertiesForUnnecessary.data,
                propertiesForUnnecessary.input,
                propertiesForUnnecessary.to,
                propertiesForUnnecessary.value,
                propertiesForUnnecessary.codeFormat,
                propertiesForUnnecessary.failKey,
                propertiesForUnnecessary.feeRatio,
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

                const expectedError = `"${unnecessaries[i].name}" cannot be used with ${caver.transaction.type.TxTypeFeeDelegatedAccountUpdate} transaction`
                expect(() => caver.transaction.feeDelegatedAccountUpdate.create(testUpdateObj)).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.getRLPEncoding', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-157: returns RLP-encoded string.', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                expect(tx.getRLPEncoding()).to.equal(expectedValues[i].rlpEncoding)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-158: getRLPEncoding should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-159: getRLPEncoding should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncoding()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.sign', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-161: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignSpy).to.have.been.calledWith(txHash, '0x7e3', 1, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-162: input: private key string. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-163: input: KlaytnWalletKey. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-164: input: keyring, index. should sign transaction with specific index.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-165: input: keyring, custom hasher. should use custom hasher.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-166: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-167: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-168: input: rolebased keyring, index out of range. should throw error.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address

                const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
                await expect(tx.sign(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.signAsFeePayer', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-169: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-170: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignSpy).to.have.been.calledWith(txHash, '0x7e3', 2, undefined)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-171: input: private key string. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-172: input: KlaytnWalletKey. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-173: input: keyring, index. should sign transaction with specific index.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-174: input: keyring, custom hasher. should use custom hasher.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-175: input: keyring, index, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-176: input: keyring. should throw error when feePayer is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
                await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-177: input: rolebased keyring, index out of range. should throw error.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `Invalid index(10): index must be less than the length of keys(${roleBasedKeyring.keys[0].length}).`
                await expect(tx.signAsFeePayer(roleBasedKeyring, 10)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdate.sign with multiple keys', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-178: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.sign(sender)

                checkFunctionCall(i)
                checkSignature(tx)
                expect(senderSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 1)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-179: input: private key string. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-180: input: KlaytnWalletKey. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-181: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-182: input: keyring. should throw error when from is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.from = roleBasedKeyring.address
                const expectedError = `The from address of the transaction is different with the address of the keyring to use.`
                await expect(tx.sign(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-183: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
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

    context('feeDelegatedAccountUpdate.signAsFeePayer with multiple keys', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-184: input: keyring. If feePayer is not defined, should be set with keyring address.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-185: input: keyring. should sign transaction.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                await tx.signAsFeePayer(feePayer)

                checkFunctionCall(i)
                checkFeePayerSignature(tx)
                expect(feePayerSignWithKeysSpy).to.have.been.calledWith(txHash, '0x7e3', 2)
            }
            expect(createFromPrivateKeySpy).not.to.have.been.called
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-186: input: private key string. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-187: input: KlaytnWalletKey. should sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-188: input: keyring, custom hasher. should use custom hasher when sign transaction.', async () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-189: input: keyring. should throw error when feePayer is different.', async () => {
            for (let i = 0; i < txsByAccountKeys.length; i++) {
                const tx = txsByAccountKeys[i]
                tx.feePayer = roleBasedKeyring.address

                const expectedError = `The feePayer address of the transaction is different with the address of the keyring to use.`
                await expect(tx.signAsFeePayer(sender)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-190: input: roleBased keyring. should sign with multiple keys and append signatures', async () => {
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

    context('feeDelegatedAccountUpdate.appendSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-191: If signatures is empty, appendSignatures append signatures in transaction', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-192: If signatures is empty, appendSignatures append signatures with two-dimensional signature array', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-193: If signatures is not empty, appendSignatures should append signatures', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-194: appendSignatures should append multiple signatures', () => {
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

    context('feeDelegatedAccountUpdate.appendFeePayerSignatures', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-195: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures in transaction', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-196: If feePayerSignatures is empty, appendFeePayerSignatures append feePayerSignatures with two-dimensional signature array', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-197: If feePayerSignatures is not empty, appendFeePayerSignatures should append feePayerSignatures', () => {
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

        it('CAVERJS-UNIT-TRANSACTIONFD-198: appendFeePayerSignatures should append multiple feePayerSignatures', () => {
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

    context('feeDelegatedAccountUpdate.combineSignedRawTransactions', () => {
        let combinedTarget
        beforeEach(() => {
            const testAddress = '0x9788016d3957e62cc7f3aa7f9f5d801e3277b4eb'
            combinedTarget = {
                from: testAddress,
                gas: '0x186a0',
                nonce: '0x1',
                gasPrice: '0x5d21dba00',
                chainId: '0x7e3',
                account: caver.account.createWithAccountKeyLegacy(testAddress),
            }
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-199: combineSignedRawTransactions combines single signature and sets signatures in transaction', () => {
            const tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x21f886018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0f847f845820fe9a05e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878a03e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24a940000000000000000000000000000000000000000c4c3018080'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x5e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878',
                    '0x3e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24a',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-200: combineSignedRawTransactions combines multiple signatures and sets signatures in transaction', () => {
            combinedTarget.signatures = [
                [
                    '0x0fe9',
                    '0x5e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878',
                    '0x3e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24a',
                ],
            ]
            const tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)

            const rlpEncodedStrings = [
                '0x21f872018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0f847f845820fe9a0dd841ac608f55a20a211599ab73b7cc8cacedb219aca053621b68a7cf1ce1625a055da30e64842b16650ec6fac6972b1344197a299c2f840190bbe01fdc82a447a80c4c3018080',
                '0x21f872018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0f847f845820feaa0187d11596f3a2c9ef922fee8ebf07aa1c7ce7ae46834c54901436d10b9e0afd8a068094e4e51f2d07b60f14df1ddb75f1afb35ed8061aa51005559beab2cc9cd4c80c4c3018080',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x21f90114018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0f8d5f845820fe9a05e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878a03e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24af845820fe9a0dd841ac608f55a20a211599ab73b7cc8cacedb219aca053621b68a7cf1ce1625a055da30e64842b16650ec6fac6972b1344197a299c2f840190bbe01fdc82a447af845820feaa0187d11596f3a2c9ef922fee8ebf07aa1c7ce7ae46834c54901436d10b9e0afd8a068094e4e51f2d07b60f14df1ddb75f1afb35ed8061aa51005559beab2cc9cd4c940000000000000000000000000000000000000000c4c3018080'

            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x5e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878',
                    '0x3e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24a',
                ],
                [
                    '0x0fe9',
                    '0xdd841ac608f55a20a211599ab73b7cc8cacedb219aca053621b68a7cf1ce1625',
                    '0x55da30e64842b16650ec6fac6972b1344197a299c2f840190bbe01fdc82a447a',
                ],
                [
                    '0x0fea',
                    '0x187d11596f3a2c9ef922fee8ebf07aa1c7ce7ae46834c54901436d10b9e0afd8',
                    '0x68094e4e51f2d07b60f14df1ddb75f1afb35ed8061aa51005559beab2cc9cd4c',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-201: combineSignedRawTransactions combines single feePayerSignature and sets feePayerSignatures in transaction', () => {
            combinedTarget.feePayer = '0x1576dfec8c77f984d627ff5e953ab527c30a3904'
            const tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)
            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const rlpEncoded =
                '0x21f886018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f847f845820feaa06f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2ca0562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8'
            const combined = tx.combineSignedRawTransactions([rlpEncoded])

            const expectedSignatures = [
                [
                    '0x0fea',
                    '0x6f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2c',
                    '0x562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.calledOnce
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(rlpEncoded)
            checkFeePayerSignature(tx, { expectedSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-202: combineSignedRawTransactions combines multiple feePayerSignatures and sets feePayerSignatures in transaction', () => {
            combinedTarget.feePayer = '0x1576dfec8c77f984d627ff5e953ab527c30a3904'
            combinedTarget.feePayerSignatures = [
                [
                    '0x0fea',
                    '0x6f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2c',
                    '0x562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8',
                ],
            ]
            const tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)

            const rlpEncodedStrings = [
                '0x21f886018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f847f845820fe9a080eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504a048975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6',
                '0x21f886018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f847f845820fe9a0ec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841a0078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a',
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

            const combined = tx.combineSignedRawTransactions(rlpEncodedStrings)

            const expectedRLPEncoded =
                '0x21f90114018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f8d5f845820feaa06f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2ca0562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8f845820fe9a080eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504a048975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6f845820fe9a0ec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841a0078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a'

            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x6f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2c',
                    '0x562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8',
                ],
                [
                    '0x0fe9',
                    '0x80eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504',
                    '0x48975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6',
                ],
                [
                    '0x0fe9',
                    '0xec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841',
                    '0x078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a',
                ],
            ]

            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)
            expect(getRLPEncodingSpy).to.have.been.calledOnce
            expect(combined).to.equal(expectedRLPEncoded)
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-203: combineSignedRawTransactions combines multiple signatures and feePayerSignatures', () => {
            let tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)

            // RLP encoding with only signatures
            const rlpEncodedStrings = [
                '0x21f90100018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0f8d5f845820fe9a05e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878a03e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24af845820fe9a0dd841ac608f55a20a211599ab73b7cc8cacedb219aca053621b68a7cf1ce1625a055da30e64842b16650ec6fac6972b1344197a299c2f840190bbe01fdc82a447af845820feaa0187d11596f3a2c9ef922fee8ebf07aa1c7ce7ae46834c54901436d10b9e0afd8a068094e4e51f2d07b60f14df1ddb75f1afb35ed8061aa51005559beab2cc9cd4c80c4c3018080',
            ]
            const expectedSignatures = [
                [
                    '0x0fe9',
                    '0x5e5922bc693162599cca35416a96f44187a7a0ac4851eddf9ad8ec8359aa8878',
                    '0x3e128291576716d0be1ef5a8dba67eb2056fa1495529a77338d9c7a7b4c5e24a',
                ],
                [
                    '0x0fe9',
                    '0xdd841ac608f55a20a211599ab73b7cc8cacedb219aca053621b68a7cf1ce1625',
                    '0x55da30e64842b16650ec6fac6972b1344197a299c2f840190bbe01fdc82a447a',
                ],
                [
                    '0x0fea',
                    '0x187d11596f3a2c9ef922fee8ebf07aa1c7ce7ae46834c54901436d10b9e0afd8',
                    '0x68094e4e51f2d07b60f14df1ddb75f1afb35ed8061aa51005559beab2cc9cd4c',
                ],
            ]

            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')
            let combined = tx.combineSignedRawTransactions(rlpEncodedStrings)
            expect(appendSignaturesSpy).to.have.been.callCount(rlpEncodedStrings.length)

            const rlpEncodedStringsWithFeePayerSignatures = [
                '0x21f90114018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f8d5f845820feaa06f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2ca0562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8f845820fe9a080eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504a048975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6f845820fe9a0ec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841a0078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a',
            ]
            const expectedFeePayerSignatures = [
                [
                    '0x0fea',
                    '0x6f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2c',
                    '0x562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8',
                ],
                [
                    '0x0fe9',
                    '0x80eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504',
                    '0x48975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6',
                ],
                [
                    '0x0fe9',
                    '0xec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841',
                    '0x078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a',
                ],
            ]

            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')
            combined = tx.combineSignedRawTransactions(rlpEncodedStringsWithFeePayerSignatures)
            expect(appendFeePayerSignaturesSpy).to.have.been.callCount(rlpEncodedStringsWithFeePayerSignatures.length)

            // combine multiple signatures and feePayerSignatures
            tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)
            const combinedWithMultiple = tx.combineSignedRawTransactions([combined])

            expect(combined).to.equal(combinedWithMultiple)
            checkSignature(tx, { expectedSignatures })
            checkFeePayerSignature(tx, { expectedFeePayerSignatures })
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-204: If decode transaction has different values, combineSignedRawTransactions should throw error', () => {
            const tx = caver.transaction.feeDelegatedAccountUpdate.create(combinedTarget)
            tx.nonce = 1234

            const rlpEncoded =
                '0x21f90114018505d21dba00830186a0949788016d3957e62cc7f3aa7f9f5d801e3277b4eb8201c0c4c3018080941576dfec8c77f984d627ff5e953ab527c30a3904f8d5f845820feaa06f06eeeb86c6980bf314a3c4c84a9f610d8ed7055e48d3176f8be8fc7c4c0e2ca0562417d4c1653f0e420c63fb427198f636eb5364b9e95626026fdabedcc33eb8f845820fe9a080eb1d684765851433b6e91c702500436704a2b74bbe9fb0e237b7486fc86504a048975a10ca36aa7b439dc9e8a6b5cfd715476ed57e43619a5ef8a9266d544ad6f845820fe9a0ec1155a838e74333b6bc2b76bb99098882c3b522e7a850f01151d37b2fac9841a0078a3216312f05e92a732f26fbe084365f37f5523dc1def47c4cea932eaa972a'
            const expectedError = `Transactions containing different information cannot be combined.`

            expect(() => tx.combineSignedRawTransactions([rlpEncoded])).to.throw(expectedError)
        })
    })

    context('feeDelegatedAccountUpdate.getRawTransaction', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-205: getRawTransaction should call getRLPEncoding function', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].rlpEncoding
                const rawTransaction = tx.getRawTransaction()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(rawTransaction).to.equal(expected)
            }
        })
    })

    context('feeDelegatedAccountUpdate.getTransactionHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-206: getTransactionHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].transactionHash
                const txHash = tx.getTransactionHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(txHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(txHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-207: getTransactionHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-208: getTransactionHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getTransactionHash()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.getSenderTxHash', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-210: getSenderTxHash should call getRLPEncoding function and return hash of RLPEncoding', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')

                const expected = expectedValues[i].senderTxHash
                const senderTxHash = tx.getSenderTxHash()

                expect(getRLPEncodingSpy).to.have.been.calledOnce
                expect(senderTxHash).to.equal(expected)
                expect(caver.utils.isValidHashStrict(senderTxHash)).to.be.true
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-211: getSenderTxHash should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-212: getSenderTxHash should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getSenderTxHash()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.getRLPEncodingForSignature', () => {
        afterEach(() => {
            sandbox.restore()
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-214: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                const commonRLPForSigningSpy = sandbox.spy(tx, 'getCommonRLPEncodingForSignature')

                const expected = expectedValues[i].rlpEncodingForSigning
                const rlpEncodingForSign = tx.getRLPEncodingForSignature()

                expect(rlpEncodingForSign).to.equal(expected)
                expect(commonRLPForSigningSpy).to.have.been.calledOnce
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-215: getRLPEncodingForSignature should throw error when nonce is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                const expectedError = `nonce is undefined. Define nonce in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-216: getRLPEncodingForSignature should throw error when gasPrice is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                const expectedError = `gasPrice is undefined. Define gasPrice in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })

        it('CAVERJS-UNIT-TRANSACTIONFD-217: getRLPEncodingForSignature should throw error when chainId is undefined', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._chainId

                const expectedError = `chainId is undefined. Define chainId in transaction or use 'transaction.fillTransaction' to fill values.`

                expect(() => tx.getRLPEncodingForSignature()).to.throw(expectedError)
            }
        })
    })

    context('feeDelegatedAccountUpdate.getCommonRLPEncodingForSignature', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-218: getRLPEncodingForSignature should return RLP-encoded transaction string for signing', () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)

                const decoded = RLP.decode(expectedValues[i].rlpEncodingForSigning)
                const commonRLPForSign = tx.getCommonRLPEncodingForSignature()

                expect(commonRLPForSign).to.equal(decoded[0])
            }
        })
    })

    context('feeDelegatedAccountUpdate.fillTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-219: fillTransaction should call klay_getGasPrice to fill gasPrice when gasPrice is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._gasPrice

                await tx.fillTransaction()
                expect(getNonceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getGasPriceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-220: fillTransaction should call klay_getTransactionCount to fill nonce when nonce is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._nonce

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getChainIdSpy).not.to.have.been.calledOnce
            }
            expect(getNonceSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-221: fillTransaction should call klay_getChainid to fill chainId when chainId is undefined', async () => {
            for (let i = 0; i < expectedValues.length; i++) {
                const tx = caver.transaction.feeDelegatedAccountUpdate.create(expectedValues[i].tx)
                delete tx._chainId

                await tx.fillTransaction()
                expect(getGasPriceSpy).not.to.have.been.calledOnce
                expect(getNonceSpy).not.to.have.been.calledOnce
            }
            expect(getChainIdSpy).to.have.been.callCount(Object.values(expectedValues).length)
        }).timeout(200000)
    })

    context('feeDelegatedAccountUpdate.recoverPublicKeys feeDelegatedAccountUpdate.recoverFeePayerPublicKeys', () => {
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
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x0',
            gas: '0x2faf080',
            signatures: [
                [
                    '0x0fe9',
                    '0xa849d233748e341d955a9008f88871e2ec618599f3a09a7722b812608b8c2c37',
                    '0x5772746c507f8b057db00d5b6b6cd0e26a41b4b6a19bfe977f3c914194753dde',
                ],
                [
                    '0x0fe9',
                    '0xc11c4db571c74b4963ac76ad8e5233102e232e05ee5fe1454597bc4d1210cf53',
                    '0x59120cb8228dc6248b166ffa56e5743655805640bd6683b6a86b03910afad093',
                ],
                [
                    '0x0fe9',
                    '0x12d280c22eb1fa66a92fa2b0cf88f4ffc30dc9bacc24adbe57cbf3aecd4607be',
                    '0x472d256d3b5ed5527ccec6ac719d68ed70ce2b29b741538bdee137102d4df968',
                ],
            ],
            feePayerSignatures: [
                [
                    '0x0fea',
                    '0x4cac4b47e5ba0b7898e56e3c645e5395fc241d1f2ccfb4c9f7c790dd7e5e26c0',
                    '0x608f3efed06c61842737439de237153ed79b6692eaa801e814ff985cf4bf6a87',
                ],
                [
                    '0x0fea',
                    '0xa7d3617041789846c16ae1f9fc0c6661421bf5fb39d3f4580a3dadd08b2cf96c',
                    '0x3f74439b085d7cd13898598c40faa4643c9ee1f2b6b0d43ec6cb4e1a72f1391e',
                ],
                [
                    '0x0fea',
                    '0xab3dec0d7f92b764041efd5b0551317374a109cbeb527e0483aacf5d5f0770c1',
                    '0x7cc7c2b88dc03bc3d3f85f610a87de867d828b66d41cc6d856e2299a463b73d4',
                ],
            ],
        }

        it('CAVERJS-UNIT-TRANSACTIONFD-525: should return public key string recovered from signatures in FeeDelegatedAccountUpdate', async () => {
            const tx = caver.transaction.feeDelegatedAccountUpdate.create({
                account: caver.account.createWithAccountKeyLegacy(txObj.from),
                ...txObj,
            })
            const publicKeys = tx.recoverPublicKeys()

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-TRANSACTIONFD-526: should return fee payer public key string recovered from feePayerSignatures in FeeDelegatedAccountUpdate', async () => {
            const tx = caver.transaction.feeDelegatedAccountUpdate.create({
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
})
