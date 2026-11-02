import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation tabs', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /回測系統/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /模擬交易/ })).toBeInTheDocument();
});
