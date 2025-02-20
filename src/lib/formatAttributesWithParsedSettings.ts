/**
 * This function takes an object of attributes and tries to parse the settings string attribute.
 * The attributes object will have a key called settings which will be a string.
 * The function will attempt to parse this string as JSON and replace the string attribute
 * with the parsed object.
 *
 * @param {Object} attributes - object with a key called settings which is a string
 * @return {Object} - object with a key called settings which is an object
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatAttributesWithParsedSettings = (attributes: Record<string, any>) => {
    try {
        const formattedAttributes = { ...attributes };
        if (typeof formattedAttributes.settings === 'string') {
            formattedAttributes.settings = JSON.parse(formattedAttributes.settings);
        }
        return formattedAttributes;
    } catch (error) {
        console.error('Error parsing settings:', error);
        return attributes;
    }
};

export default formatAttributesWithParsedSettings;