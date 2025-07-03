import { render, screen, fireEvent } from '@testing-library/react';
import ActionButton from './ActionButton';

describe('ActionButton', () => {
  it('should render children', () => {
    render(<ActionButton onClick={() => {}}>Test Button</ActionButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<ActionButton onClick={onClick}>Click</ActionButton>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ActionButton onClick={() => {}} disabled>Disabled</ActionButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply the correct color class', () => {
    const { container } = render(<ActionButton onClick={() => {}} color="danger">Danger</ActionButton>);
    expect(container.firstChild).toHaveClass('bg-red-600');
  });
}); 