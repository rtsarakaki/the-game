import { render, screen } from '@testing-library/react';
import PlayerList from './PlayerList';

describe('PlayerList', () => {
  it('should render all player names', () => {
    render(<PlayerList players={['Ana', 'Bruno', 'Carlos']} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('should highlight the current player', () => {
    const { container } = render(<PlayerList players={['Ana', 'Bruno']} currentPlayer="Bruno" />);
    const current = screen.getByText('Bruno');
    expect(current).toHaveClass('font-bold');
    expect(container.querySelector('.text-blue-700')).toBeInTheDocument();
  });

  it('should show (vez) only for the current player', () => {
    render(<PlayerList players={['Ana', 'Bruno']} currentPlayer="Bruno" />);
    expect(screen.getByText('(vez)')).toBeInTheDocument();
    expect(screen.queryByText((_, el) => el?.textContent === '(vez)' && el.previousSibling?.textContent === 'Ana')).toBeNull();
  });
}); 