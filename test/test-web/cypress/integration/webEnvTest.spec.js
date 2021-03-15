describe('executing test scenario on the localhost:3000', () => {
	beforeEach(() => {
		cy.visit('http://localhost:3000')
	})

	it('get block number test via caver-js bundle', (done) => {
		cy.get('[id="success"]', { timeout: 10000 }).should('be.visible')
		cy.get('[id="blockNumber"]').then(ele => {
			const innerHTML = ele.text()
			const blockNumber = innerHTML.split(': ')[innerHTML.split(': ').length-1]
			expect(blockNumber).not.to.be.undefined
			expect(blockNumber).not.to.equal('0x')
			expect(blockNumber.includes('0x')).to.be.true
			done()
		})
	})

	it('get block number test via react component', (done) => {
		cy.get('[id="blockNumberInReactComponent"]', { timeout: 10000 }).should('be.visible')
		cy.get('[id="blockNumberInReactComponent"]').then(ele => {
			const blockNumber = ele.text()
			expect(blockNumber).not.to.equal(-1)
			done()
		})
	})
})