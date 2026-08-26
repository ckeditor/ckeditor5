/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { env,
	isMac, isWindows, isGecko, isSafari, isiOS, isAndroid, isRegExpUnicodePropertySupported, isBlink, getUserAgent,
	isMediaForcedColors, isMotionReduced
} from '../src/env.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { global } from '../src/dom/global.js';

function toLowerCase( str ) {
	return str.toLowerCase();
}

describe( 'Env', () => {
	it( 'is an object', () => {
		expect( env ).to.be.an( 'object' );
	} );

	describe( 'isMac', () => {
		it( 'is a boolean', () => {
			expect( env.isMac ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isWindows', () => {
		it( 'is a boolean', () => {
			expect( env.isWindows ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isGecko', () => {
		it( 'is a boolean', () => {
			expect( env.isGecko ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isSafari', () => {
		it( 'is a boolean', () => {
			expect( env.isSafari ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isiOS', () => {
		it( 'is a boolean', () => {
			expect( env.isiOS ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isAndroid', () => {
		it( 'is a boolean', () => {
			expect( env.isAndroid ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isBlink', () => {
		it( 'is a boolean', () => {
			expect( env.isBlink ).to.be.a( 'boolean' );
		} );
	} );

	describe( 'isMediaForcedColors', () => {
		let matchMediaMock;

		beforeEach( () => {
			matchMediaMock = vi.spyOn( global.window, 'matchMedia' );
		} );

		it( 'is a boolean', () => {
			mockMediaForcedColors();

			expect( env.isMediaForcedColors ).toBe( true );
		} );

		it( 'should watch changes in forced colors setting', () => {
			mockMediaForcedColors();

			expect( env.isMediaForcedColors ).toBe( true );

			mockMediaForcedColors( false );

			expect( env.isMediaForcedColors ).toBe( false );
		} );

		function mockMediaForcedColors( enabled = true ) {
			return matchMediaMock.mockImplementation( query => {
				if ( query === '(forced-colors: active)' ) {
					return { matches: enabled };
				}

				return { matches: false };
			} );
		}
	} );

	describe( 'isMotionReduced', () => {
		let matchMediaMock;

		beforeEach( () => {
			matchMediaMock = vi.spyOn( global.window, 'matchMedia' );
		} );

		it( 'is a boolean', () => {
			mockMotionReduced();

			expect( env.isMotionReduced ).toBe( true );
		} );

		it( 'should watch changes in reduced motion setting', () => {
			mockMotionReduced();

			expect( env.isMotionReduced ).toBe( true );

			mockMotionReduced( false );

			expect( env.isMotionReduced ).toBe( false );
		} );

		function mockMotionReduced( enabled = true ) {
			return matchMediaMock.mockImplementation( query => {
				if ( query === '(prefers-reduced-motion)' ) {
					return { matches: enabled };
				}

				return { matches: false };
			} );
		}
	} );

	describe( 'features', () => {
		it( 'is an object', () => {
			expect( env.features ).to.be.an( 'object' );
		} );

		describe( 'isRegExpUnicodePropertySupported', () => {
			it( 'is a boolean', () => {
				expect( env.features.isRegExpUnicodePropertySupported ).to.be.a( 'boolean' );
			} );
		} );
	} );

	describe( 'isMac()', () => {
		it( 'returns true for macintosh UA strings', () => {
			expect( isMac( 'macintosh' ) ).toBe( true );
			expect( isMac( 'foo macintosh bar' ) ).toBe( true );

			expect( isMac( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/61.0.3163.100 Safari/537.36'
			) ) ).toBe( true );
		} );

		it( 'returns false for non–macintosh UA strings', () => {
			expect( isMac( '' ) ).toBe( false );
			expect( isMac( 'mac' ) ).toBe( false );
			expect( isMac( 'foo' ) ).toBe( false );
		} );
	} );

	describe( 'isWindows()', () => {
		it( 'returns true for Windows UA strings', () => {
			expect( isWindows( 'windows' ) ).toBe( true );

			expect( isWindows( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0'
			) ) ).toBe( true );

			expect( isWindows( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
			) ) ).toBe( true );
		} );

		it( 'returns false for non-Windows UA strings', () => {
			expect( isWindows( '' ) ).toBe( false );
			expect( isWindows( 'macintosh' ) ).toBe( false );
			expect( isWindows( 'foo' ) ).toBe( false );
		} );
	} );

	describe( 'isGecko()', () => {
		it( 'returns true for Firefox UA strings', () => {
			expect( isGecko( 'gecko/42' ) ).toBe( true );
			expect( isGecko( 'foo gecko/42 bar' ) ).toBe( true );

			expect( isGecko( toLowerCase(
				'mozilla/5.0 (macintosh; intel mac os x 10.13; rv:62.0) gecko/20100101 firefox/62.0'
			) ) ).toBe( true );
		} );

		it( 'returns false for non–Edge UA strings', () => {
			expect( isGecko( '' ) ).toBe( false );
			expect( isGecko( 'foo' ) ).toBe( false );
			expect( isGecko( 'Mozilla' ) ).toBe( false );

			// Chrome
			expect( isGecko( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
			) ) ).toBe( false );
		} );
	} );

	describe( 'isSafari()', () => {
		/* eslint-disable @stylistic/max-len */
		it( 'returns true for Safari UA strings', () => {
			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15'
			) ) ).toBe( true );

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
			) ) ).toBe( true );
		} );

		it( 'returns false for non-Safari UA strings', () => {
			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).toBe( false );

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).toBe( false );

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).toBe( false );
		} );
		/* eslint-enable @stylistic/max-len */
	} );

	describe( 'isiOS()', () => {
		/* eslint-disable @stylistic/max-len */
		it( 'returns true for Safari@iPhone UA string ("Request Mobile Website")', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
			) ) ).toBe( true );
		} );

		it( 'returns true for Safari@iPad UA string ("Request Mobile Website")', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPad; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
			) ) ).toBe( true );
		} );

		it( 'returns true for Safari UA string ("Request Desktop Website")', () => {
			// This is how you tell Safari@Mac from Safari@iOS.
			vi.spyOn( global.window.navigator, 'maxTouchPoints', 'get' ).mockReturnValue( 3 );

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
			) ) ).toBe( true );
		} );

		it( 'returns true for Chrome UA string', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPad; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/95.0.4638.50 Mobile/15E148 Safari/604.1'
			) ) ).toBe( true );
		} );

		it( 'returns false for non-iOS UA strings', () => {
			// Safari on Mac
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
			) ) ).toBe( false );

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).toBe( false );

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).toBe( false );
		} );
		/* eslint-enable @stylistic/max-len */
	} );

	describe( 'isAndroid()', () => {
		/* eslint-disable @stylistic/max-len */
		it( 'returns true for Android UA strings', () => {
			// Strings taken from https://developer.chrome.com/multidevice/user-agent.
			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev> (KHTML, like Gecko) Chrome/<Chrome Rev> Mobile Safari/<WebKit Rev>'
			) ) ).toBe( true );

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev>(KHTML, like Gecko) Chrome/<Chrome Rev> Safari/<WebKit Rev>'
			) ) ).toBe( true );
		} );

		it( 'returns false for non-Android UA strings', () => {
			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).toBe( false );

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).toBe( false );

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko'
			) ) ).toBe( false );
		} );
		/* eslint-enable @stylistic/max-len */
	} );

	describe( 'isBlink()', () => {
		/* eslint-disable @stylistic/max-len */
		it( 'returns true for Blink UA strings', () => {
			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).toBe( true );

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).toBe( true );

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.52'
			) ) ).toBe( true );
		} );

		it( 'returns false for non-Blink UA strings', () => {
			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15'
			) ) ).toBe( false );

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
			) ) ).toBe( false );

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).toBe( false );

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
			) ) ).toBe( false );
		} );
		/* eslint-enable @stylistic/max-len */
	} );

	describe( 'isMediaForcedColors()', () => {
		it( 'returns true if the document media query matches forced-colors', () => {
			vi.spyOn( global.window, 'matchMedia' ).mockImplementation( query => {
				if ( query === '(forced-colors: active)' ) {
					return { matches: true };
				}

				return { matches: false };
			} );

			expect( isMediaForcedColors() ).toBe( true );
		} );

		it( 'returns false if the document media query does not match forced-colors', () => {
			vi.spyOn( global.window, 'matchMedia' ).mockImplementation( query => {
				if ( query === '(forced-colors: active)' ) {
					return { matches: false };
				}

				return { matches: true };
			} );

			expect( isMediaForcedColors() ).toBe( false );
		} );

		it( 'returns false if window object is not available', () => {
			// `global.window` is an empty object if `window` was not available in global space.
			const _window = global.window;
			global.window = {};

			expect( isMediaForcedColors() ).toBe( false );

			global.window = _window;
		} );
	} );

	describe( 'isMotionReduced()', () => {
		it( 'returns true if the document media query matches prefers-reduced-motion', () => {
			vi.spyOn( global.window, 'matchMedia' ).mockImplementation( query => {
				if ( query === '(prefers-reduced-motion)' ) {
					return { matches: true };
				}

				return { matches: false };
			} );

			expect( isMotionReduced() ).toBe( true );
		} );

		it( 'returns false if the document media query does not match prefers-reduced-motion', () => {
			vi.spyOn( global.window, 'matchMedia' ).mockImplementation( query => {
				if ( query === '(prefers-reduced-motion)' ) {
					return { matches: false };
				}

				return { matches: true };
			} );

			expect( isMotionReduced() ).toBe( false );
		} );

		it( 'returns false if window object is not available', () => {
			// `global.window` is an empty object if `window` was not available in global space.
			const _window = global.window;
			global.window = {};

			expect( isMotionReduced() ).toBe( false );

			global.window = _window;
		} );
	} );

	describe( 'isRegExpUnicodePropertySupported()', () => {
		it( 'should detect accessibility of unicode properties', () => {
			// Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534)
			const testFn = () => ( new RegExp( '\\p{L}', 'u' ) ).test( 'ć' );

			let testFnOutcome;

			try {
				testFnOutcome = testFn();
			} catch {
				testFnOutcome = 'error';
			}

			const expectedOutcome = isRegExpUnicodePropertySupported() ? true : 'error';

			expect( testFnOutcome ).toEqual( expectedOutcome );
		} );
	} );

	describe( 'getUserAgent()', () => {
		it( 'should return user agent in lower case', () => {
			vi.spyOn( global.window.navigator, 'userAgent', 'get' ).mockReturnValue( 'CKBrowser' );

			expect( getUserAgent() ).toEqual( 'ckbrowser' );
		} );

		it( 'should return empty string if navigator API is unavailable', () => {
			vi.spyOn( global.window, 'navigator', 'get' ).mockReturnValue( undefined );

			expect( getUserAgent() ).toEqual( '' );
		} );

		it( 'should not throw an error if navigator API is unavailable', () => {
			vi.spyOn( global.window, 'navigator', 'get' ).mockReturnValue( undefined );

			expect( () => {
				getUserAgent();
			} ).to.not.throw();
		} );
	} );
} );
