/**
 * Darken a hex color by a percentage
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} - Darkened hex color
 */
export function darkenColor(hex, percent) {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken
  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Deep merge two objects
 * @param {Object} defaults - Default configuration
 * @param {Object} custom - User configuration
 * @returns {Object} - Merged configuration
 */
export function mergeConfig(defaults, custom) {
  const merged = JSON.parse(JSON.stringify(defaults)); // Deep clone defaults
  
  for (const key in custom) {
    if (custom.hasOwnProperty(key)) {
      if (typeof custom[key] === 'object' && custom[key] !== null && 
          typeof merged[key] === 'object' && merged[key] !== null &&
          !Array.isArray(custom[key])) {
        // If both properties are objects, recursively merge them
        merged[key] = mergeConfig(merged[key], custom[key]); // Recursive call
      } else {
        // Otherwise, override with custom value
        merged[key] = custom[key];
      }
    }
  }
  
  return merged;
}

/**
 * Check if a string is a URL
 * @param {string} str - The string to check
 * @returns {boolean} - Whether the string is a URL
 */
export function isUrl(str) {
  if (typeof str !== 'string') return false;
  try {
    // If the string starts with http:// or https://, or is a valid URL, return true
    return str.startsWith('http://') || 
           str.startsWith('https://') || 
           str.startsWith('data:') ||
           /^(www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(str);
  } catch (e) {
    return false;
  }
}

/**
 * Check if a string is a valid JSON object with icon config
 * @param {string} str - The string to check
 * @returns {object|null} - The parsed object or null if not valid
 */
export function parseIconConfig(str) {
  if (typeof str !== 'string') return null;
  try {
    // Try to parse as JSON
    const config = JSON.parse(str);
    // Check if it has the expected icon properties
    if (config && typeof config === 'object' && config.url) {
      return config;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Create element for icon (SVG code or image URL)
 * @param {string} iconContent - SVG code, image URL, or JSON config
 * @param {string} [size=null] - Icon size (e.g., '24px')
 * @returns {string} - HTML for the icon
 */
export function createIconElement(iconContent, size = null) {
  if (!iconContent) return '';
  
  // First, check if it's a JSON configuration object for URL-based icons
  const iconConfig = parseIconConfig(iconContent); // Uses exported parseIconConfig
  
  if (iconConfig) {
    // It's a JSON config with URL and potentially other settings
    const width = iconConfig.size || size || '24'; // Ensure size is a string if it's px
    const height = iconConfig.size || size || '24';
    
    let styles = `max-width: 100%; height: auto;`;
    
    return `<img src="${iconConfig.url}" width="${width.replace('px', '')}" height="${height.replace('px', '')}" alt="Icon" style="${styles}">`;
  }
  
  // If not a JSON config, check if it's a direct URL
  if (isUrl(iconContent)) { // Uses exported isUrl
    const width = size || '24';
    const height = size || '24';
    
    return `<img src="${iconContent}" width="${width.replace('px', '')}" height="${height.replace('px', '')}" alt="Icon" style="max-width: 100%; height: auto;">`;
  }
  
  // Otherwise, assume it's SVG code and return it directly
  return iconContent;
}
