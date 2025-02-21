/* eslint-disable react/no-unknown-property */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SupportPage from '@/app/support/page';

// Mock the Adobe Spectrum components
jest.mock('@adobe/react-spectrum', () => ({
  TextArea: ({ onChange, value, label, ...props }: any) => (
    <textarea
      onChange={(e) => onChange(e.target.value)}
      value={value}
      aria-label={label}
      {...props}
    />
  ),
  TextField: ({ onChange, value, label, type, ...props }: any) => (
    <input
      type={type}
      onChange={(e) => onChange(e.target.value)}
      value={value}
      aria-label={label}
      {...props}
    />
  ),
  Picker: ({ onSelectionChange, selectedKey, label, children }: any) => (
    <select
      onChange={(e) => onSelectionChange(e.target.value)}
      value={selectedKey}
      aria-label={label}
    >
      {children}
    </select>
  ),
  Item: ({ children, ...props }: any) => (
    <option {...props}>{children}</option>
  ),
  InlineAlert: ({ children }: any) => <div role="alert">{children}</div>,
  Heading: ({ children }: any) => <h2>{children}</h2>,
  Content: ({ children }: any) => <div>{children}</div>,
}));

describe('SupportPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    global.fetch = jest.fn();
  });

  it('renders the support form', () => {
    render(<SupportPage />);

    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  it('allows selecting different subjects', async () => {
    render(<SupportPage />);

    const subjectSelect = screen.getByLabelText('Subject');
    await userEvent.selectOptions(subjectSelect, 'Search');

    expect(subjectSelect).toHaveValue('Search');
  });

  it('allows typing a message', async () => {
    render(<SupportPage />);

    const messageInput = screen.getByLabelText('Message');
    await userEvent.type(messageInput, 'Test support message');

    expect(messageInput).toHaveValue('Test support message');
  });

  it('handles successful form submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<SupportPage />);

    const emailInput = screen.getByLabelText('Email');
    const messageInput = screen.getByLabelText('Message');
    const subjectSelect = screen.getByLabelText('Subject');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(messageInput, 'Test support message');
    await userEvent.selectOptions(subjectSelect, 'Search');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Support Email Sent')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/sendsupportemail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Search',
        message: 'Test support message',
        userEmail: 'test@example.com',
        userId: 'anonymous'
      }),
    });
  });

  it('handles failed form submission', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to send'));

    render(<SupportPage />);

    const emailInput = screen.getByLabelText('Email');
    const messageInput = screen.getByLabelText('Message');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(messageInput, 'Test support message');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('There was an error sending your message. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables submit button while sending', async () => {
    // Create a promise that we won't resolve immediately
    let resolveRequest: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    (global.fetch as jest.Mock).mockReturnValue(fetchPromise);

    render(<SupportPage />);

    const emailInput = screen.getByLabelText('Email');
    const messageInput = screen.getByLabelText('Message');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(messageInput, 'Test support message');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Sending...');
  });


});
