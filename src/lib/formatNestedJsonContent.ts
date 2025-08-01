/**
 * This function formats nested JSON content by beautifying nested JSON strings
 * and formatting JavaScript code within customSetup fields
 *
 * @param obj - The object to format
 * @return String with beautified JSON
 */

// Format JavaScript code with proper indentation
const formatJavaScriptCode = (code: string): string => {
	// First, aggressively unescape any escaped characters
	// Handle double-escaped newlines first
	code = code
		.replace(/\\\\n/g, "\n") // Handle \\n -> \n
		.replace(/\\n/g, "\n") // Handle \n -> actual newline
		.replace(/\\\\t/g, "\t") // Handle \\t -> \t
		.replace(/\\t/g, "    ") // Handle \t -> 4 spaces
		.replace(/\\r/g, "") // Remove carriage returns
		.replace(/\\\\(?![\"'\\])/g, "\\") // Handle double backslashes
		.replace(/\\\"(?!\")/g, '"') // Handle escaped quotes
		.replace(/\\\\'(?!')/g, "'"); // Handle escaped single quotes

	// Clean up any remaining multiple newlines
	code = code.replace(/\n\s*\n\s*\n/g, "\n\n");

	// Add spacing around operators for readability
	code = code
		.replace(/([^\s])=/g, "$1 =") // Add space before =
		.replace(/=([^\s=])/g, "= $1") // Add space after =
		.replace(/([^\s])&&/g, "$1 &&") // Add space before &&
		.replace(/&&([^\s])/g, "&& $1") // Add space after &&
		.replace(/([^\s])\|\|/g, "$1 ||") // Add space before ||
		.replace(/\|\|([^\s])/g, "|| $1") // Add space after ||
		.replace(/([^\s])\?/g, "$1 ?") // Add space before ?
		.replace(/\?([^\s])/g, "? $1") // Add space after ?
		.replace(/([^\s:]):/g, "$1 :") // Add space before : (but not ::)
		.replace(/:([^\s:])/g, ": $1"); // Add space after : (but not ::)

	let formatted = "";
	let indentLevel = 0;
	const lines = code
		.replace(/;\s*/g, ";\n") // Add newline after semicolons
		.replace(/{\s*/g, "{\n") // Add newline after opening braces
		.replace(/}\s*/g, "\n}") // Add newline before closing braces
		.replace(/\)\s*{/g, ")\n{") // Add newline between ) and {
		.replace(/else\s*{/g, "else\n{") // Add newline after else
		.replace(/\s*else\s+if\s*\(/g, "\nelse if(") // Format else if
		.replace(/\n\s*\n/g, "\n") // Remove empty lines
		.replace(/\s*=\s*/g, " = ") // Add space around equals
		.replace(/\s*\?\s*/g, " ? ") // Add space around ternary
		.replace(/\s*:\s*/g, " : ") // Add space around colon
		.replace(/\s*&&\s*/g, " && ") // Add space around logical AND
		.replace(/\s*\|\|\s*/g, " || ") // Add space around logical OR
		.replace(/\+=/g, " += ") // Space around +=
		.replace(/-=/g, " -= ") // Space around -=
		.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (!line) continue;

		// Adjust indent based on braces
		if (line.endsWith("{")) {
			formatted += "\n" + " ".repeat(indentLevel * 2) + line;
			indentLevel++;
		} else if (line.startsWith("}")) {
			indentLevel = Math.max(0, indentLevel - 1);
			formatted += "\n" + " ".repeat(indentLevel * 2) + line;
		} else {
			formatted += "\n" + " ".repeat(indentLevel * 2) + line;
		}
	}

	return formatted.trim();
};

// Pretty print JSON with proper indentation
const formatJsonString = (json: string | object): string => {
	try {
		// If json is already an object, stringify it
		if (typeof json === "object" && json !== null) {
			// Use a replacer function to handle circular references
			const cache = new Set();
			const formattedJson = JSON.stringify(
				json,
				(key, value) => {
					if (typeof value === "object" && value !== null) {
						if (cache.has(value)) {
							return "[Circular Reference]";
						}
						cache.add(value);
					}
					return value;
				},
				2
			);
			return formattedJson;
		}

		// Otherwise parse it first (if it's a string)
		if (typeof json === "string") {
			const parsed = JSON.parse(json);
			return JSON.stringify(parsed, null, 2);
		}

		return String(json);
	} catch (_e) {
		// If parsing fails, return the original string
		return typeof json === "string" ? json : String(json);
	}
};

/**
 * Process an object and format any nested JSON strings or JavaScript code
 * This helper processes each field recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processObject = (obj: any): any => {
	// Handle null or primitive values
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		return obj.map((item) => processObject(item));
	}

	// Handle objects
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(obj)) {
		// Special handling for customSetup objects that are already parsed
		if (key === "customSetup" && typeof value === "object" && value !== null && "source" in value && typeof value.source === "string") {
			// Format the source JavaScript code in an already-parsed customSetup object
			const customSetup = value as { source: string; [key: string]: unknown };
			const formattedSource = formatJavaScriptCode(customSetup.source);
			result[key] = {
				...customSetup,
				source: formattedSource,
			};
		}
		// Format string values that might be code or JSON
		else if (typeof value === "string" && (key === "customSetup" || value.trim().startsWith("{") || value.trim().startsWith("["))) {
			try {
				// Try to parse as JSON first
				const parsedJson = JSON.parse(value);

				// Special handling for customSetup field which contains JavaScript code
				if (key === "customSetup" && typeof parsedJson === "object" && parsedJson !== null) {
					if (typeof parsedJson.source === "string") {
						// Format the source JavaScript code
						const formattedSource = formatJavaScriptCode(parsedJson.source);

						// Create a nicely formatted version with the formatted source
						const formattedJson = {
							...parsedJson,
							source: formattedSource,
						};

						// Return the properly formatted object
						result[key] = formattedJson;
					} else {
						// If no source, just add the parsed JSON
						result[key] = parsedJson;
					}
				} else {
					// For all other objects, add the parsed JSON
					result[key] = parsedJson;
				}
			} catch (_e) {
				// If it's not valid JSON, format it as code if it looks like JS code
				if (key === "customSetup" || value.includes("function") || value.includes("var ") || value.includes("const ") || value.includes("let ")) {
					result[key] = formatJavaScriptCode(value);
				} else if (key === "settings" || key === "attributes") {
					// Try to format as JSON if it looks like JSON
					result[key] = formatJsonString(value);
				} else {
					result[key] = value; // Keep as-is if it's not code
				}
			}
		} else if (typeof value === "object" && value !== null) {
			// Recursively process nested objects
			result[key] = processObject(value);
		} else {
			// Keep other values as is
			result[key] = value;
		}
	}

	return result;
};

/**
 * Main formatter function to beautify nested JSON and JavaScript
 * @param obj - The object to format
 * @returns The formatted object with beautified nested JSON and JS
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatNestedJsonContent = (obj: any): any => {
	return processObject(obj);
};

export default formatNestedJsonContent;
