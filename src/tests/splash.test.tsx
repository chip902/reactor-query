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
jest.mock('@spectrum-icons/workflow/Search', () => () => <div data-testid="search-icon" />);
jest.mock('@spectrum-icons/workflow/Question', () => () => <div data-testid="question-icon" />);
jest.mock('@spectrum-icons/workflow/Checkmark', () => () => <div data-testid="checkmark-icon" />);
jest.mock('@spectrum-icons/workflow/DataCorrelated', () => () => <div data-testid="data-correlated-icon" />);

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

  it('renders navigation buttons correctly', () => {
    render(<MarketingSplash />);
    
    const searchButton = screen.getByRole('button', { name: /start searching/i });
    const relationshipsButton = screen.getByRole('button', { name: /view relationships/i });
    const faqButton = screen.getByRole('button', { name: /faq/i });
    
    // Check buttons and their styling
    expect(searchButton).toHaveClass('bg-blue-600');
    expect(relationshipsButton).toHaveClass('bg-blue-600');
    expect(faqButton).toHaveClass('bg-blue-100');

    // Check links
    expect(searchButton.closest('a')).toHaveAttribute('href', '/search');
    expect(relationshipsButton.closest('a')).toHaveAttribute('href', '/relationships');
    expect(faqButton.closest('a')).toHaveAttribute('href', '#faq');
  });

  it('renders features correctly', () => {
    render(<MarketingSplash />);

    const features = [
      'Better Search Experience',
      'Rule & Data Element Relationships',
      'Data Element & Rule Export',
      'View Entire Publish History'
    ];

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('renders with the correct styling classes', () => {
    render(<MarketingSplash />);
    
    const mainContainer = document.querySelector('.min-h-screen.bg-white');
    expect(mainContainer).toBeInTheDocument();
  });
});
