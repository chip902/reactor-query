// This does the yellow highlighting of the search query in your search results

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const highlightSearchInJson = (json: any, searchValue: string): string => {
	// If no search term, just return the properly formatted JSON
	if (!searchValue || !searchValue.trim()) {
		// Handle strings that might already be formatted JSON or code
		if (typeof json === "string") {
			return json;
		}

		// For objects, stringify with proper formatting
		try {
			return JSON.stringify(json, null, 2);
		} catch (_e) {
			// Handle circular references or other stringification issues
			return typeof json === "string" ? json : String(json);
		}
	}

	// Handle cases where json is already formatted with HTML
	if (typeof json === "string" && (json.includes("<span") || json.includes("</span>"))) {
		// Escape special regex characters in the search value
		const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const searchRegex = new RegExp(escapedSearchValue, "gi");

		// Only highlight text nodes, not inside HTML tags
		// This regex matches text between > and < but not inside tags
		let highlightedContent = "";
		let inTag = false;
		let currentText = "";

		// Process the string character by character to avoid regex complexity
		for (let i = 0; i < json.length; i++) {
			const char = json[i];
			if (char === "<") {
				// We're entering a tag
				if (!inTag && currentText) {
					// Highlight the text we've accumulated so far
					highlightedContent += currentText.replace(searchRegex, (m) => `<span class="highlight">${m}</span>`);
					currentText = "";
				}
				inTag = true;
				highlightedContent += char;
			} else if (char === ">") {
				// We're exiting a tag
				inTag = false;
				highlightedContent += char;
			} else if (inTag) {
				// We're inside a tag, just add the character
				highlightedContent += char;
			} else {
				// We're in text content, accumulate it
				currentText += char;
			}
		}

		// Process any remaining text
		if (currentText) {
			highlightedContent += currentText.replace(searchRegex, (m) => `<span class="highlight">${m}</span>`);
		}

		return highlightedContent;
	}

	// For regular JSON objects, handle normally
	try {
		// Create a safe copy of the data without functions or circular references
		const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
		const safeJson = JSON.parse(jsonString);

		// Escape special regex characters in the search value
		const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const searchRegex = new RegExp(escapedSearchValue, 'gi');
		const modifiedJson = JSON.stringify(safeJson, (key, value) => {
			if (typeof value === 'string') {
				// Apply search highlighting
				return value.replace(searchRegex, (m) => `<span class="highlight">${m}</span>`);
			}
			return value;
		}, 2);

		// After JSON.stringify, convert escaped newlines to HTML breaks for proper rendering
		return modifiedJson.replace(/\\n/g, '<br>');
	} catch (_error) {
		// If parsing fails, try to highlight in the original string
		if (typeof json === 'string') {
			const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const searchRegex = new RegExp(escapedSearchValue, 'gi');
			// Apply highlighting and convert escaped newlines to HTML breaks
			const result = json.replace(searchRegex, m => `<span class="highlight">${m}</span>`);
			return result.replace(/\\n/g, '<br>');
		}

		// Last resort: return as string
		return String(json);
	}
};

export default highlightSearchInJson;
