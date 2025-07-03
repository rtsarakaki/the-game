import { render, screen } from '@testing-library/react';
import ErrorPanel from './ErrorPanel';

describe('ErrorPanel', () => {
  it('should render children', () => {
    render(<ErrorPanel>Some error</ErrorPanel>);
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('should not render if children is falsy', () => {
    const { container } = render(<ErrorPanel>{null}</ErrorPanel>);
    expect(container.firstChild).toBeNull();
  });
}); 