// This does the yellow highlighting of the search query in your search results

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const highlightSearchInJson = (json: any, searchValue: string): string => {
    if (!searchValue) return JSON.stringify(json, null, 2);

    // Create a safe copy of the data without functions or circular references
    const safeJson = JSON.parse(JSON.stringify(json));

    // Escape special regex characters in the search value
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearchValue, 'gi');
    const modifiedJson = JSON.stringify(safeJson, (key, value) => {
        if (typeof value === 'string') {
            return value.replace(searchRegex, (m) => `<span class="bg-yellow-200">${m}</span>`);
        }
        return value;
    }, 2);

    return modifiedJson;
};

export default highlightSearchInJson;