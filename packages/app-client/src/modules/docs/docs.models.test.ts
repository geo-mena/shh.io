import { describe, expect, test } from 'vitest';
import { buildDocUrl } from './docs.models';

describe('docs models', () => {
  describe('buildDocUrl', () => {
    test('it creates a url to the documentation', () => {
      expect(
        buildDocUrl({
          path: '/test',

          baseUrl: 'https://docs-shh.tofi.pro',
        }),
      ).to.eql('https://docs-shh.tofi.pro/test');
    });

    test('it uses the default base url', () => {
      expect(buildDocUrl({ path: '/test' })).to.eql('https://docs-shh.tofi.pro/test');
    });

    test('it handles clashing slashes', () => {
      expect(
        buildDocUrl({
          path: '/test',
          baseUrl: 'https://docs-shh.tofi.pro/',
        }),
      ).to.eql('https://docs-shh.tofi.pro/test');
    });
  });
});
