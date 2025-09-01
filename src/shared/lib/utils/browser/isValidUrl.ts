/**
 * Checks if a string is a valid URL
 * @param text The string to check
 * @returns Boolean indicating if the string is a valid URL
 */
export const isValidUrl = (text: string): boolean => {
  if (/@/.test(text)) {
    return false;
  }

  const validTLDs = [
    'com',
    'org',
    'net',
    'edu',
    'gov',
    'mil',
    'io',
    'co',
    'info',
    'biz',
    'dev',
    'name',
    'pro',
    'app',
    'blog',
    'club',
    'design',
    'store',
    'tech',
    'site',
    'online',
    'uk',
    'de',
    'fr',
    'jp',
    'cn',
    'ru',
    'br',
    'in',
    'au',
    'ca',
    'eu',
    'us',
    'it',
  ];

  if (/^https?:\/\//.test(text)) {
    return true;
  }

  if (/^localhost(:\d+)?(\/.*)?$/.test(text)) {
    return false; // Require protocol for localhost
  }

  const parts = text.split('.');
  if (parts.length >= 2) {
    const tld = parts[parts.length - 1].toLowerCase();
    return validTLDs.includes(tld);
  }

  return false;
};

/**
 * Prepends 'http://' to a URL if it doesn't already start with 'http'
 * @param text The URL string
 * @returns The URL with proper protocol prefix
 */
export const getUrlWithProtocol = (text: string): string => {
  return text.startsWith('http') ? text : 'http://' + text;
};
