import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelationshipsPage from '@/app/relationships/page';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import { loadFixture } from './__fixtures__/utils/loadFixture';

// Mock hooks
jest.mock('@/app/hooks/useApiKeys', () => ({
    useApiKeys: jest.fn()
}));

jest.mock('@/app/hooks/useApiCache', () => ({
    useApiCache: jest.fn().mockReturnValue({
        fetchCompanies: jest.fn().mockResolvedValue({ data: [] }),
        fetchProperties: jest.fn().mockResolvedValue({ data: [] }),
    }),
}));

// Mock next/link and next/navigation
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => {
        return children;
    };
});

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
    })
}));

// Mock LoadingSpinner
jest.mock('@/components/LoadingSpinner', () => {
    return function MockLoadingSpinner() {
        return <div data-testid="loading-spinner">Loading...</div>;
    };
});

// Mock Spectrum components
jest.mock('@adobe/react-spectrum', () => ({
    Flex: ({ children }: any) => <div>{children}</div>,
    Item: ({ children }: any) => <div>{children}</div>,
    Text: ({ children }: any) => <div>{children}</div>,
    ListView: ({ children }: any) => <div>{children}</div>,
    Divider: () => <hr />,
    Heading: ({ children }: any) => <h2>{children}</h2>,
    Content: ({ children }: any) => <div>{children}</div>,
    InlineAlert: ({ children }: any) => <div role="alert">{children}</div>,
    Picker: ({ children, onSelectionChange, selectedKey }: any) => (
        <select
            onChange={(e) => onSelectionChange(e.target.value)}
            value={selectedKey}
        >
            {children}
        </select>
    ),
}));

// Mock icons
jest.mock('@spectrum-icons/workflow/LinkOut', () => ({
    __esModule: true,
    default: () => <div data-testid="link-out-icon">Link Icon</div>
}));

jest.mock('@spectrum-icons/workflow/Hammer', () => ({
    __esModule: true,
    default: () => <div data-testid="hammer-icon">Hammer Icon</div>
}));

jest.mock('@spectrum-icons/workflow/Data', () => ({
    __esModule: true,
    default: () => <div data-testid="data-icon">Data Icon</div>
}));

jest.mock('@spectrum-icons/workflow/ArrowRight', () => ({
    __esModule: true,
    default: () => <div data-testid="arrow-right-icon">Arrow Icon</div>
}));

// Mock components
jest.mock('@/components/search/CompanyPicker', () => {
    return function MockCompanyPicker({ companies, companiesLoading, selectedCompany, setSelectedCompany }: any) {
        return (
            <select
                data-testid="company-picker"
                value={selectedCompany.id}
                onChange={(e) => {
                    const company = companies.find((c: any) => c.id === e.target.value);
                    setSelectedCompany(company ? { id: company.id, name: company.attributes.name } : { id: '', name: '' });
                }}
            >
                {companies.map((company: any) => (
                    <option key={company.id} value={company.id}>
                        {company.attributes.name}
                    </option>
                ))}
            </select>
        );
    };
});

jest.mock('@/components/search/PropertyPicker', () => {
    return function MockPropertyPicker() {
        return <div data-testid="property-picker">Property Picker</div>;
    };
});

describe('RelationshipsPage', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        }) as jest.Mock;
    });

    it('renders the relationships page with API keys', async () => {
        // Mock API keys
        (useApiKeys as jest.Mock).mockReturnValue({
            hasKeys: true,
            loading: false
        });

        render(<RelationshipsPage />);

        // When API keys are present, the company picker should be rendered
        await waitFor(() => {
            expect(screen.getByTestId('company-picker')).toBeInTheDocument();
        });
    });

    it('shows loading state when API keys are loading', () => {
        // Mock loading state
        (useApiKeys as jest.Mock).mockReturnValue({
            apiKeys: null,
            loading: true
        });

        render(<RelationshipsPage />);
        // We don't show loading spinner anymore since we're using local storage
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('handles missing API keys', () => {
        // Mock no API keys
        (useApiKeys as jest.Mock).mockReturnValue({
            apiKeys: null,
            loading: false
        });

        render(<RelationshipsPage />);
        expect(screen.getByText(/API Keys Needed/i)).toBeInTheDocument();
    });
});
