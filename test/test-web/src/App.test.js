import { waitFor } from '@testing-library/react'
import App from './App'
import Adapter from 'enzyme-adapter-react-16'
import { mount, configure } from 'enzyme'

configure({ adapter: new Adapter() })

test('Render App component and wait for getting block number to test caver works', async() => {
  const wrapper = mount(<App />)

  await waitFor(() =>{
    // The initial state is -1.
    // Wait until state is not -1 and check the value.
    expect(wrapper.state().blockNumber).not.toBe(-1)
    expect(typeof wrapper.state().blockNumber).toBe('number')
  })
})
