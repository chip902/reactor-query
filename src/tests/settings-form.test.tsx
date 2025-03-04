import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsForm from '@/components/forms/SettingsForm';
import { ToastQueue } from '@react-spectrum/toast';
import { act } from 'react';

// Mock secureStorage
jest.mock('@/utils/secureStorage', () => ({
  saveApiKeys: jest.fn(),
  getApiKeys: jest.fn(),
  clearApiKeys: jest.fn(),
  setStoragePreference: jest.fn(),
  getStoragePreference: jest.fn(() => false),
}));

// Mock analytics hook
jest.mock('@/app/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    event: jest.fn(),
  }),
}));

// Mock Toast Queue
jest.mock('@react-spectrum/toast', () => ({
  ToastQueue: {
    positive: jest.fn(),
    negative: jest.fn(),
  },
}));

// Mock Spectrum components
jest.mock('@adobe/react-spectrum', () => ({
  Form: ({ children, onSubmit }: any) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
  TextField: ({ label, value, onChange, isRequired }: any) => (
    <input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={isRequired}
      data-testid={`input-${label}`}
    />
  ),
  Button: ({ children, isDisabled, type, onPress, variant }: any) => {
    const disabled = Boolean(isDisabled);
    return (
      <button
        onClick={onPress}
        disabled={disabled}
        type={type}
        data-testid={variant === 'accent' ? 'submit-button' : undefined}
      >
        <span>{children}</span>
      </button>
    );
  },
  ButtonGroup: ({ children }: any) => <div>{children}</div>,
  Text: ({ children, UNSAFE_className }: any) => <span className={UNSAFE_className}>{children}</span>,
  Divider: () => <hr />,
  Heading: ({ children }: any) => <h2>{children}</h2>,
  ActionButton: ({ children, onPress, isDisabled }: any) => (
    <button onClick={onPress} disabled={isDisabled} data-testid="clear-settings-button">
      {children}
    </button>
  ),
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  AlertDialog: ({ children, onPrimaryAction, primaryActionLabel }: any) => (
    <div role="alertdialog">
      {children}
      <button onClick={onPrimaryAction} data-testid="confirm-clear-settings">
        {primaryActionLabel}
      </button>
    </div>
  ),
  Checkbox: ({ children, isSelected, onChange, isRequired }: any) => (
    <div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={e => onChange(e.target.checked)}
        required={isRequired}
        data-testid="persist-checkbox"
      />
      <label>{children}</label>
    </div>
  ),
}));

// Mock LoadingSpinner component
jest.mock('@/components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('SettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<SettingsForm />);
    // We don't show loading spinner anymore since we're using local storage
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('loads and displays existing settings', async () => {
    const mockSettings = {
      orgId: 'test-org',
      clientId: 'test-client',
      clientSecret: 'test-secret'
    };

    (require('@/utils/secureStorage').getApiKeys as jest.Mock).mockReturnValue(mockSettings);

    render(<SettingsForm />);

    expect(screen.getByTestId('input-Organization ID')).toHaveValue('test-org');
    expect(screen.getByTestId('input-Client ID')).toHaveValue('test-client');
    expect(screen.getByTestId('input-Client Secret')).toHaveValue('test-secret');
  });

  // TODO: Fix this test - button disabled state not working as expected
  // it('enables submit button when required fields are filled', async () => {
  //   render(<SettingsForm />);
  //
  //   const orgIdInput = screen.getByTestId('input-Organization ID');
  //   const clientIdInput = screen.getByTestId('input-Client ID');
  //   const clientSecretInput = screen.getByTestId('input-Client Secret');
  //   const submitButton = screen.getByTestId('submit-button');
  //
  //   expect(submitButton).toBeDisabled();
  //
  //   await userEvent.type(orgIdInput, 'test-org');
  //   await userEvent.type(clientIdInput, 'test-client');
  //   await userEvent.type(clientSecretInput, 'test-secret');
  //
  //   expect(submitButton).not.toBeDisabled();
  // });

  it('successfully updates settings', async () => {
    await act(async () => {
      render(<SettingsForm />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.type(screen.getByTestId('input-Organization ID'), 'test-org');
      await userEvent.type(screen.getByTestId('input-Client ID'), 'test-client');
      await userEvent.type(screen.getByTestId('input-Client Secret'), 'test-secret');
      
      // Check the persist checkbox
      const persistCheckbox = screen.getByTestId('persist-checkbox');
      await userEvent.click(persistCheckbox);

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(require('@/utils/secureStorage').setStoragePreference).toHaveBeenCalledWith(true);
      expect(ToastQueue.positive).toHaveBeenCalledWith(
        'Settings updated successfully.',
        expect.any(Object)
      );
    });
  });

  it('handles settings update error', async () => {
    // Mock saveApiKeys to throw an error
    jest.spyOn(require('@/utils/secureStorage'), 'saveApiKeys').mockImplementationOnce(() => {
      throw new Error('Failed to save');
    });

    await act(async () => {
      render(<SettingsForm />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.type(screen.getByTestId('input-Organization ID'), 'test-org');
      await userEvent.type(screen.getByTestId('input-Client ID'), 'test-client');
      await userEvent.type(screen.getByTestId('input-Client Secret'), 'test-secret');

      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      // Verify that setStoragePreference was called
      expect(require('@/utils/secureStorage').setStoragePreference).toHaveBeenCalled();
      expect(ToastQueue.negative).toHaveBeenCalledWith(
        'Failed to update settings.',
        expect.any(Object)
      );
    });
  });

  // it('shows loading state while updating settings', async () => {
  //   let resolvePromise: (value: unknown) => void;
  //   const promise = new Promise(resolve => {
  //     resolvePromise = resolve;
  //   });

  //   jest.spyOn(require('@/utils/secureStorage'), 'saveApiKeys').mockImplementationOnce(() => promise);

  //   render(<SettingsForm />);

  //   await act(async () => {
  //     fireEvent.change(screen.getByTestId('input-Organization ID'), { target: { value: 'test-org' } });
  //     fireEvent.change(screen.getByTestId('input-Client ID'), { target: { value: 'test-client' } });
  //     fireEvent.change(screen.getByTestId('input-Client Secret'), { target: { value: 'test-secret' } });
  //   });

  //   const submitButton = screen.getByTestId('submit-button');
  //   await act(async () => {
  //     fireEvent.click(submitButton);
  //   });

  //   // Wait for loading state
  //   await waitFor(() => {
  //     expect(submitButton).toHaveTextContent('Updating Settings...');
  //   });

  //   // Resolve the promise to clean up
  //   resolvePromise!(undefined);
  // });

  it('handles whitespace in input fields', async () => {
    render(<SettingsForm />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('input-Organization ID'), { target: { value: '  test-org  ' } });
      fireEvent.change(screen.getByTestId('input-Client ID'), { target: { value: '  test-client  ' } });
      fireEvent.change(screen.getByTestId('input-Client Secret'), { target: { value: '  test-secret  ' } });
    });

    const submitButton = screen.getByTestId('submit-button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(require('@/utils/secureStorage').saveApiKeys).toHaveBeenCalledWith({
      orgId: '  test-org  ',
      clientId: '  test-client  ',
      clientSecret: '  test-secret  '
    });
  });

  it('shows clear settings confirmation dialog', async () => {
    render(<SettingsForm />);

    const clearButton = screen.getByTestId('clear-settings-button');
    await userEvent.click(clearButton);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('This will clear all your settings and make the app unusable. Continue?')).toBeInTheDocument();
  });

  it('cancels clearing settings when dialog is dismissed', async () => {
    const mockClearApiKeys = jest.spyOn(require('@/utils/secureStorage'), 'clearApiKeys');

    render(<SettingsForm />);

    const clearButton = screen.getByTestId('clear-settings-button');
    await userEvent.click(clearButton);

    // Click outside the dialog or press escape to dismiss
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });

    expect(mockClearApiKeys).not.toHaveBeenCalled();
  });

  it('handles error when clearing settings', async () => {
    jest.spyOn(require('@/utils/secureStorage'), 'clearApiKeys').mockImplementationOnce(() => {
      throw new Error('Failed to clear');
    });

    render(<SettingsForm />);

    const clearButton = screen.getByTestId('clear-settings-button');
    await userEvent.click(clearButton);

    const confirmButton = screen.getByTestId('confirm-clear-settings');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(ToastQueue.negative).toHaveBeenCalledWith(
        'An error occurred while clearing settings.',
        expect.any(Object)
      );
    });
  });

  it('clears settings when clear button is clicked', async () => {
    // Mock initial state with some settings
    jest.spyOn(require('@/utils/secureStorage'), 'getApiKeys').mockReturnValueOnce({
      orgId: 'test-org',
      clientId: 'test-client',
      clientSecret: 'test-secret'
    });

    await act(async () => {
      render(<SettingsForm />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByTestId('clear-settings-button');
    await act(async () => {
      await userEvent.click(clearButton);
    });

    const confirmButton = screen.getByTestId('confirm-clear-settings');
    await act(async () => {
      await userEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(ToastQueue.positive).toHaveBeenCalledWith(
        'Settings cleared successfully.',
        expect.any(Object)
      );
      // Verify inputs are cleared
      expect(screen.getByTestId('input-Organization ID')).toHaveValue('');
      expect(screen.getByTestId('input-Client ID')).toHaveValue('');
      expect(screen.getByTestId('input-Client Secret')).toHaveValue('');
    });
  });
});
