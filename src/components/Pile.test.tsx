import { render, screen, fireEvent } from '@testing-library/react';
import Pile from './Pile';

describe('Pile', () => {
  it('should render the label and top card', () => {
    render(<Pile label="Subida 1" topCard={33} type="asc" selected={false} onClick={() => {}} />);
    expect(screen.getByText('Subida 1')).toBeInTheDocument();
    expect(screen.getAllByText('33').length).toBeGreaterThan(0);
  });

  it('should apply selected styles when selected', () => {
    const { container } = render(<Pile label="Descida 1" topCard={99} type="desc" selected={true} onClick={() => {}} />);
    expect(container.firstChild).toHaveClass('ring-4');
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Pile label="Subida 2" topCard={10} type="asc" selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Pile label="Descida 2" topCard={88} type="desc" selected={false} onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
}); 