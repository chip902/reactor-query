import React from 'react';
import { render, screen } from '@testing-library/react';
import MarketingSplash from '@/app/splash/page';
import '@testing-library/jest-dom';
import { PRODUCT_NAME } from '@/lib/constants';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});


// Mock the spectrum icons
jest.mock('@spectrum-icons/workflow/ArrowRight', () => () => <div data-testid="arrow-right-icon" />);
jest.mock('@spectrum-icons/workflow/Question', () => () => <div data-testid="question-icon" />);
jest.mock('@spectrum-icons/workflow/Checkmark', () => () => <div data-testid="checkmark-icon" />);

describe('MarketingSplash', () => {
  it('renders the main heading correctly', () => {
    render(<MarketingSplash />);
    
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getByText(PRODUCT_NAME)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<MarketingSplash />);
    
    const descriptionRegex = new RegExp(`Connect your Launch properties to ${PRODUCT_NAME} to add what Launch is missing`);
    expect(screen.getByText(descriptionRegex)).toBeInTheDocument();
  });

  it('renders navigation links correctly', () => {
    render(<MarketingSplash />);
    
    const getStartedButtons = screen.getAllByRole('button', { name: /get started/i });
    const faqButton = screen.getByRole('button', { name: /faq/i });
    
    // Check the primary get started button
    expect(getStartedButtons[0]).toHaveClass('bg-blue-600');
    expect(faqButton).toBeInTheDocument();
    expect(faqButton.closest('a')).toHaveAttribute('href', '#faq');
  });

  it('renders with the correct styling classes', () => {
    render(<MarketingSplash />);
    
    const mainContainer = document.querySelector('.min-h-screen.bg-white');
    expect(mainContainer).toBeInTheDocument();
  });
});
