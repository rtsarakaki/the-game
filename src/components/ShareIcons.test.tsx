import { render } from '@testing-library/react';
import { CopyIcon, EmailIcon, WhatsAppIcon, CopyAllIcon, CheckIcon } from './ShareIcons';

describe('ShareIcons', () => {
  it('should render CopyIcon with correct props', () => {
    render(<CopyIcon size={16} className="test-class" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveClass('test-class');
  });

  it('should render EmailIcon with default props', () => {
    render(<EmailIcon />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('should render WhatsAppIcon with custom size', () => {
    render(<WhatsAppIcon size={24} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should render CopyAllIcon with hover animations', () => {
    render(<CopyAllIcon className="hover:animate-pulse" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('hover:animate-pulse');
  });

  it('should render CheckIcon with correct viewBox', () => {
    render(<CheckIcon />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should apply custom className to all icons', () => {
    const customClass = 'custom-test-class';
    
    render(<CopyIcon className={customClass} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass(customClass);
  });

  it('should have correct stroke and fill attributes', () => {
    render(<EmailIcon />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('should render with hover effects and transitions', () => {
    render(<CopyIcon />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('transition-transform');
    expect(svg).toHaveClass('hover:scale-110');
  });
}); 