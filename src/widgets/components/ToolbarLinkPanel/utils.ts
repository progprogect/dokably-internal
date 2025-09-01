import isURL from 'validator/lib/isURL';

/**
 * Checks url string for url scheme and adds it if it's missing.
 * Custom schemes are not allowed.
 * @param url url string to be validated
 * @returns string with url scheme
 */
export function validateAndAddURLScheme(url: string): string {
  isURL(url, {
    require_protocol: false,
  });
  // Possibly it is better to introduce whitelist of schemes and URLs, even better to do it on the BE side.
  const urlScheme = 'http://';
  const urlSchemeRegex = /^https?:\/\//i;
  const urlWithScheme = urlSchemeRegex.test(url) ? url : `${urlScheme}${url}`;
  new URL(urlWithScheme);
  return urlWithScheme;
}

/**
For testingyou can use following strings:
valid URLs
    http://example-domain.com
    https://example-domain.com
    ftp://example-domain.com
    file:///home/user/documents/example.txt
    tel:+1234567890
    mailto:user@example-domain.com
    git://github.com/user/repository.git
    irc://chat.example-domain.com/channel
    magnet:?xt=urn:btih:1234567890abcdef
    news:comp.lang.python
    data:text/plain;charset=utf-8,Hello%20World!
    ldap://ldap.example-domain.com/dc=example,dc=com
    ssh://example-domain.com/user@localhost
    sip:someone@example-domain.com
    rtsp://example-domain.com/video.mp4
    urn:isbn:9780393041422
    dict://dict.org/d:example
    smb://example-domain.com/share/file.txt
    bitcoin:3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
    about:blank

invalid URLs
    https:/example.com (missing a second forward slash)
    https//example.com (missing a colon after the scheme)
    https:// example.com (space between the scheme and domain name)
    https://example (missing top-level domain name)
    https://example..com (extra dot in the domain name)
    https://.example.com (leading dot in the domain name)
    https://example.com/ path (missing a colon after the domain name)
    https://example.com?query= (missing a query parameter value)
    https://example.com?query (missing an equal sign after the query parameter)
    https://example.com?query1&query2=value2 (missing an equal sign after query1 and a value for query1)
    https://example.com#fragment (missing a slash before the fragment identifier)
    https://example..com (extra dot in the domain name)
    https://-example.com (hyphen at the beginning of the domain name)
    https://example-.com (hyphen at the end of the domain name)
    https://example.com: (missing a port number)
    https://example.com:port (missing a colon between the domain name and port number)
    https://example.com:80a (non-numeric characters in the port number)
    https://[::1]80 (missing a colon between the IPv6 address and the port number)
    https://example.com?query=value#fragment (missing an ampersand between the query parameter and fragment identifier)
    https://example.com/?query=value#fragment (missing a path segment after the forward slash in the URI path)
 */