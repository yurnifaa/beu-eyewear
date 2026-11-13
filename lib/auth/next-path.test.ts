import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { safeNextPath } from './next-path';

describe('safeNextPath', () => {
  it('keeps ordinary same-site paths', () => {
    assert.equal(safeNextPath('/account'), '/account');
    assert.equal(safeNextPath('/listing?category=classic&sort=price-asc'), '/listing?category=classic&sort=price-asc');
    assert.equal(safeNextPath('/check-out#pay'), '/check-out#pay');
  });

  it('falls back for anything that is not a path', () => {
    for (const value of [undefined, null, 42, '', 'account', 'https://evil.com', 'javascript:alert(1)', 'http://evil.com/x']) {
      assert.equal(safeNextPath(value), '/account', String(value));
    }
  });

  it('rejects protocol-relative and backslash tricks', () => {
    for (const value of ['//evil.com', '//evil.com/path', '/\\evil.com', '/\\/evil.com', '/foo\\bar']) {
      assert.equal(safeNextPath(value), '/account', JSON.stringify(value));
    }
  });

  it('rejects tabs and newlines that browsers strip before parsing', () => {
    // "/<TAB>/evil.com" becomes "//evil.com" in a browser.
    for (const value of ['/\t/evil.com', '/\n/evil.com', '/\r/evil.com', '/\t\\evil.com', '/ok\u0000', '/ok\u007f']) {
      assert.equal(safeNextPath(value), '/account', JSON.stringify(value));
    }
  });

  it('uses the caller fallback', () => {
    assert.equal(safeNextPath('//evil.com', '/home'), '/home');
  });

  it('rejects very long values', () => {
    assert.equal(safeNextPath(`/${'a'.repeat(600)}`), '/account');
  });
});
