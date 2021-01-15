// @flow strict

/*::
export type CacheControlRequestDirective =
  | { type: 'max-age', maxAgeSeconds: number }
  | { type: 'max-stale', maxStaleSeconds: number }
  | { type: 'no-cache' }
*/

/*::
export type CacheControlResponseDirective =
| { type: 'max-age', maxAgeSeconds: number }
| { type: 'no-cache' }
| { type: 'no-store' }
*/

const getResponseDirectivesFromHeader = (header/*: ?string*/)/*: CacheControlResponseDirective[]*/ => {
  if (!header)
    return [];
  return header
    .split(',')
    .map(f => f.trim())
    .map(f => {
      const [name, value] = f.split('=', 2);
      switch (name) {
        case 'max-age':
          return { type: 'max-age', maxAgeSeconds: parseInt(value, 10) }
        case 'no-cache':
          return { type: 'no-cache' }
        case 'no-store':
          return { type: 'no-store' }
        default:
          return null;
      }
    })
    .filter(Boolean)
};

module.exports = {
  getResponseDirectivesFromHeader,
};
