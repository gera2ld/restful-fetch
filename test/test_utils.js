import assert from 'assert';
import {toQueryString} from '../src/utils';

describe('Utilities', () => {
  describe('toQueryString', () => {
    it('should ignore empty data', () => {
      assert.equal(toQueryString(), '');
      assert.equal(toQueryString({}), '');
    });

    it('should ignore null and undefined', () => {
      assert.equal(toQueryString({a: null}), '');
      assert.equal(toQueryString({a: undefined}), '');
      assert.equal(toQueryString({a: 'b', c: null}), '?a=b');
    });

    it('should encode normal data', () => {
      assert.equal(toQueryString({a: 'hello'}), '?a=hello');
      assert.equal(toQueryString({a: 1, b: 0}), '?a=1&b=0');
      assert.equal(toQueryString({a: false}), '?a=false');
    });

    it('should encode complexed objects', () => {
      assert.equal(
        decodeURIComponent(toQueryString({a: {b: 'c'}, d: 'e', f: [1, 2, 3]})),
        '?a[b]=c&d=e&f[]=1&f[]=2&f[]=3');
    });
  });
});
