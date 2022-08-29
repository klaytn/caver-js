const Caver = require('./index')

const caver = new Caver('https://api.baobab.klaytn.net:8651')

// How to run paladex.js
// - Replace `0x{private key}` to your private key string
// - Check the provider url (If you want to run script on the Cypress network, modify url above)
// - Run `node ./paladex.js`

const routerABI = [
    {
        constant: false,
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amountTokenDesired', type: 'uint256' },
            { name: 'amountTokenMin', type: 'uint256' },
            { name: 'amountKLAYMin', type: 'uint256' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'addLiquidityKLAY',
        outputs: [
            { name: 'amountToken', type: 'uint256' },
            { name: 'amountKLAY', type: 'uint256' },
            { name: 'liquidity', type: 'uint256' },
        ],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'token0', type: 'address' },
            { indexed: true, name: 'token1', type: 'address' },
            { indexed: false, name: 'pair', type: 'address' },
            { indexed: false, name: '', type: 'uint256' },
        ],
        name: 'PairCreated',
        type: 'event',
    },
]

createLiquidityPoolKLAYKCT()
async function createLiquidityPoolKLAYKCT() {
    const keyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey('0x{private key}'))

    // Deploy KCT Token
    const jamieToken = await caver.kct.kip7.deploy(
        {
            name: 'Jamie',
            symbol: 'JMET',
            decimals: 18,
            initialSupply: '1000000000000000000000000000',
        },
        keyring.address
    )
    console.log(`KCT Token address: ${jamieToken.options.address}\n`)

    // Below addresses are in Baobab network
    // const paladexAddress =  '0x66ec1b0c3bf4c15a76289ac36098704acd44170f' // in Cypress
    const paladexAddress = '0xc1bd5ce04757cfddde55416fc5882d3fca27d234'

    // Create a liquidity pool and mint LP tokens
    const router = caver.contract.create(routerABI, paladexAddress)
    const desiredTokenAmount = caver.utils.convertToPeb(10, 'KLAY')
    const desiredKLAYAmount = caver.utils.convertToPeb(10, 'KLAY')
    // Before adding liquidity KLAY-KCT, approve token to ClaimSwap Router contract
    const approved = await jamieToken.approve(router.options.address, desiredTokenAmount, { from: keyring.address })
    console.log(`Approved KCT Token to Pala DEX Router(${router.options.addresss}) Status: ${Boolean(approved.status)}`)
    const sendOptions = { from: keyring.address, gas: 10000000, value: desiredKLAYAmount }
    const addedLiquidityKLAY = await router.send(
        sendOptions,
        'addLiquidityKLAY',
        jamieToken.options.address,
        desiredTokenAmount,
        1, // amountTokenMin: Must be <= desiredTokenAmount
        1, // amountKLAYMin: Must be <= desiredKLAYAmount
        keyring.address, // to: Recipient of the liquidity tokens.
        Date.now() + 5000 // deadline: Unix timestamp after which the transaction will revert.
    )
    console.log(`Added Liquidity KLAY Status: ${Boolean(addedLiquidityKLAY.status)}`)
    const pairAddress = addedLiquidityKLAY.events.PairCreated.returnValues.pair

    const pairContract = caver.kct.kip7.create(pairAddress)
    console.log(
        `KLAY-KCT(${jamieToken.options.address}) Pair Total Supply: ${caver.utils.convertFromPeb(await pairContract.totalSupply(), 'KLAY')}`
    )
    console.log(
        `KCT Balance of the Pair Contract(${pairAddress}): ${caver.utils.convertFromPeb(
            await jamieToken.balanceOf(pairAddress),
            'KLAY'
        )} KCT`
    )
}
