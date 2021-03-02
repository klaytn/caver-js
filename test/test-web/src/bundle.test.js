const {Builder, Capabilities, By, until} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver')

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build())

jest.setTimeout(300000)

describe('executing test scenario on the localhost:3000', () => {
  let driver

  beforeAll(async () => {
    const options = new chrome.Options();
      options.addArguments(
        'headless',
        'disable-gpu',
      );
    driver = new Builder().withCapabilities(Capabilities.chrome()).setChromeOptions(options).build()
    await driver.get('http://localhost:3000')
  }, 100000)

  afterAll(async () => {
    await driver.quit() 
  }, 150000)
 
  test('bundle test', async() => {
      await driver.wait(until.elementLocated(By.id('success')), 5000)

      const ele = await driver.findElement(By.id('blockNumber'))
      const innerHTML = await ele.getAttribute('innerHTML')
      const blockNumber = innerHTML.split(': ')[innerHTML.split(': ').length-1]

      expect(blockNumber).not.toBe.undefined
      expect(blockNumber).not.toBe('0x')
      expect(blockNumber.includes('0x')).toBe.true
  })
})

