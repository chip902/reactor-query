# Test Fixtures

This directory contains test fixtures that can be used across all tests. These fixtures provide consistent, realistic data for testing purposes.

## Directory Structure

```
__fixtures__/
├── api/                    # API response fixtures
│   ├── search/            # Search-related responses
│   ├── signals/           # Signals-related responses
│   └── settings/          # Settings-related responses
└── utils/                 # Utility functions
    └── loadFixture.ts     # Functions to load fixtures
```

## Using Fixtures

1. Import the loadFixture utility:
```typescript
import { loadFixture } from '../__fixtures__/utils/loadFixture';
```

2. Load a fixture in your test:
```typescript
// Async loading
const data = await loadFixture('api/search/search_results.json');

// Sync loading
const data = loadFixtureSync('api/search/search_results.json');
```

3. Use with fetch mocks:
```typescript
global.fetch = jest.fn().mockImplementation(async (url) => {
    if (url.includes('/api/search')) {
        const mockData = await loadFixture('api/search/search_results.json');
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
    }
});
```

## Adding New Fixtures

1. Create a new JSON file in the appropriate directory under `api/`
2. Use real API responses when possible to ensure accuracy
3. Remove any sensitive information (API keys, tokens, etc.)
4. Document any modifications made to the real response

## Benefits

- Consistent test data across all tests
- Real-world API response structures
- Easy to update when API changes
- Reduces test setup boilerplate
- Makes tests more maintainable
