import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';

configure({ adapter: new Adapter() });

test('renders learn react link', async() => {
  render(<App />);
  const linkElement = screen.getByText(/BlockNumber/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders learn react link', async() => {
  const wrapper = mount(<App />);

  await waitFor(() =>{
    expect(wrapper.state().blockNumber).not.toBe(-1);
    expect(typeof wrapper.state().blockNumber).toBe('number');
  })
});
