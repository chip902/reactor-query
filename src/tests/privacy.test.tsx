import { render, screen } from '@testing-library/react';
import PrivacyPolicy from '../app/privacy/page';

describe('Privacy Policy Page', () => {
  it('renders all privacy policy sections', () => {
    render(<PrivacyPolicy />);

    // Check main heading
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();

    // Check all section headings are present
    const expectedHeadings = [
      'Data Collection and Usage',
      'Data Security',
      'Marketing & Data Selling',
      'Cost',
      'Contact Us'
    ];

    expectedHeadings.forEach(heading => {
      expect(screen.getByRole('heading', { name: new RegExp(heading, 'i') })).toBeInTheDocument();
    });

    // Check key content is present
    const expectedContent = [
      'Usage analytics are collected via Google Analytics',
      'Basic event statistics: Page views, Searches, etc.',
      'Application performance metrics',
      'API monitoring and error logging',
      'API keys are stored encrypted in your browser\'s session storage',
      'No marketing pixels, tracking cookies',
      'No data is sold to any third parties',
      '100% free to use',
      'support@perpetua.digital'
    ];

    expectedContent.forEach(content => {
      expect(screen.getAllByText(new RegExp(content, 'i')).length).toBeGreaterThan(0);
    });

    // Check list items in Data Security section
    const securityMeasures = [
      'API keys are stored encrypted in your browser\'s session storage',
      'API keys sent in headers are redacted in API monitoring',
      'No data is stored on the server or in a database',
      'No PII is collected such as email address, organization name, etc.'
    ];

    securityMeasures.forEach(measure => {
      expect(screen.getByText(new RegExp(measure, 'i'))).toBeInTheDocument();
    });
  });

  it('renders with correct container styling', () => {
    render(<PrivacyPolicy />);
    
    // Check main container has correct classes
    const container = screen.getByRole('heading', { name: /privacy policy/i }).parentElement;
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-4xl');

    // Check sections have correct margin
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      expect(section).toHaveClass('mb-8');
    });
  });
});
