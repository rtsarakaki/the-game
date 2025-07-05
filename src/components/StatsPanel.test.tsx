import { render, screen } from '@testing-library/react';
import StatsPanel from './StatsPanel';

describe('StatsPanel', () => {
  it('should render all stats', () => {
    render(<StatsPanel totalCardsPlayed={10} rounds={3} cardsLeft={5} playersLeft={2} />);
    expect(screen.getByText('Cartas jogadas:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Cartas restantes:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Jogadores restantes:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Rodadas completas:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
}); 