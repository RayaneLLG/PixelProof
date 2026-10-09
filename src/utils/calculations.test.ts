/**
 * PixelProof — Unit Tests for Algorithmic & Mathematical Functions
 * Tests aspect ratio, file size formatting, proportional resizing, and percentage size difference.
 */

import {
  formatBytes,
  gcd,
  calculateAspectRatio,
  calculateProportionalDimensions,
  calculatePercentageDiff,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  getLuminance,
} from './mathAndFormatting';
import { normalizePath } from '../router/Router';

export function runTests(): { total: number; passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let total = 0;
  let passed = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      passed++;
    } else {
      errors.push(`Assertion failed: ${message}`);
    }
  }

  // 1. formatBytes tests
  assert(formatBytes(0) === '0 B', 'formatBytes(0) should be 0 B');
  assert(formatBytes(1024) === '1 KB', 'formatBytes(1024) should be 1 KB');
  assert(formatBytes(1048576) === '1 MB', 'formatBytes(1048576) should be 1 MB');
  assert(formatBytes(1572864, 1) === '1.5 MB', 'formatBytes(1572864, 1) should be 1.5 MB');
  assert(formatBytes(-10) === '0 B', 'formatBytes negative should be 0 B');

  // 2. gcd tests
  assert(gcd(1920, 1080) === 120, 'gcd(1920, 1080) should be 120');
  assert(gcd(3840, 2160) === 240, 'gcd(3840, 2160) should be 240');
  assert(gcd(1080, 1080) === 1080, 'gcd(1080, 1080) should be 1080');

  // 3. calculateAspectRatio tests
  const ar16_9 = calculateAspectRatio(1920, 1080);
  assert(ar16_9.ratioString === '16:9', '1920x1080 ratio should be 16:9');
  assert(ar16_9.decimal === 1.7778, '1920x1080 decimal should be 1.7778');
  assert(Boolean(ar16_9.nearestStandard?.includes('16:9')), '1920x1080 should match 16:9 standard');

  const ar1_1 = calculateAspectRatio(1080, 1080);
  assert(ar1_1.ratioString === '1:1', '1080x1080 ratio should be 1:1');
  assert(ar1_1.decimal === 1, '1080x1080 decimal should be 1');

  const ar4_3 = calculateAspectRatio(1440, 1080);
  assert(ar4_3.ratioString === '4:3', '1440x1080 ratio should be 4:3');

  const ar9_16 = calculateAspectRatio(1080, 1920);
  assert(ar9_16.ratioString === '9:16', '1080x1920 ratio should be 9:16');

  // 4. calculatePercentageDiff tests
  const diffHalved = calculatePercentageDiff(1000, 500);
  assert(diffHalved.percent === 50, 'Halved file should be 50%');
  assert(diffHalved.isReduction === true, 'Halved file should be a reduction');

  const diffSame = calculatePercentageDiff(1000, 1000);
  assert(diffSame.isSame === true, 'Identical size should report isSame');

  const diffDoubled = calculatePercentageDiff(500, 1000);
  assert(diffDoubled.percent === -100, 'Doubled size should be -100%');
  assert(diffDoubled.isReduction === false, 'Doubled size is not a reduction');

  // 5. calculateProportionalDimensions tests
  const resizeW = calculateProportionalDimensions(1920, 1080, 1280, undefined);
  assert(resizeW.width === 1280, 'Width should scale to 1280');
  assert(resizeW.height === 720, 'Height should scale proportionally to 720');
  assert(resizeW.scaleFactor === 0.6667, 'Scale factor should be ~0.6667');

  const resizeH = calculateProportionalDimensions(1920, 1080, undefined, 540);
  assert(resizeH.width === 960, 'Width should scale to 960');
  assert(resizeH.height === 540, 'Height should scale to 540');

  const upscale = calculateProportionalDimensions(100, 100, 200, undefined);
  assert(Boolean(upscale.warning?.includes('Upscaling')), 'Upscale should generate quality warning');

  // 5b. Regression tests: NaN and zero dimensions in resize calculator
  const nanW = calculateProportionalDimensions(1920, 1080, NaN, undefined);
  assert(!isNaN(nanW.width) && !isNaN(nanW.height), 'NaN targetWidth should not produce NaN');

  const zeroOriginal = calculateProportionalDimensions(0, 0, 100, 100);
  assert(zeroOriginal.width === 0 && zeroOriginal.height === 0, 'Zero original dimensions should be handled safely');

  // 6. Color conversions
  assert(rgbToHex(255, 255, 255) === '#FFFFFF', 'rgbToHex white');
  assert(rgbToHex(37, 99, 235) === '#2563EB', 'rgbToHex blue');

  const rgb = hexToRgb('#2563EB');
  assert(rgb?.r === 37 && rgb?.g === 99 && rgb?.b === 235, 'hexToRgb blue');

  const hsl = rgbToHsl(255, 0, 0);
  assert(hsl.h === 0 && hsl.s === 100 && hsl.l === 50, 'rgbToHsl pure red');

  const lumWhite = getLuminance(255, 255, 255);
  const lumBlack = getLuminance(0, 0, 0);
  assert(lumWhite === 1, 'White luminance should be 1');
  assert(lumBlack === 0, 'Black luminance should be 0');

  // 7. Regression tests: Route normalization for direct navigation & nested routes
  assert(normalizePath('/') === '/', 'Root path should remain /');
  assert(normalizePath('/tools/image-inspector/') === '/tools/image-inspector', 'Trailing slash should be stripped from tool routes');
  assert(normalizePath('/guides/') === '/guides', 'Trailing slash should be stripped from /guides/');
  assert(normalizePath('/guides/aspect-ratios-explained/') === '/guides/aspect-ratios-explained', 'Trailing slash should be stripped from nested guide routes');
  assert(normalizePath('/about?ref=footer') === '/about', 'Query string should be stripped during path normalization');
  assert(normalizePath('/contact#form') === '/contact', 'Hash fragment should be stripped during path normalization');
  assert(normalizePath('') === '/', 'Empty path should default to /');

  return { total, passed, failed: total - passed, errors };
}

// Self-run when executed directly via tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('calculations.test')) {
  const result = runTests();
  if (result.failed > 0) {
    console.error(`Tests failed: ${result.failed} / ${result.total}`);
    result.errors.forEach((e) => console.error(e));
    process.exit(1);
  } else {
    console.log(`✓ All ${result.total} calculation tests passed successfully.`);
  }
}
