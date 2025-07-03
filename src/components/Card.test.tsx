import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('should render the card value', () => {
    render(<Card value={42} selected={false} onClick={() => {}} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should apply selected styles when selected', () => {
    const { container } = render(<Card value={10} selected={true} onClick={() => {}} />);
    expect(container.firstChild).toHaveClass('ring-4');
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Card value={5} selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByText('5'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Card value={7} selected={false} onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
}); 