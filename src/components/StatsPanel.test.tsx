import { render, screen } from '@testing-library/react';
import StatsPanel from './StatsPanel';

describe('StatsPanel', () => {
  it('should render all stats', () => {
    render(<StatsPanel cardsLeft={5} />);
    expect(screen.getByText('Cartas restantes:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
}); 