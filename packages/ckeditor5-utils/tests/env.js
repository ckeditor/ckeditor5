/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import env, {
	isMac, isWindows, isGecko, isSafari, isiOS, isAndroid, isRegExpUnicodePropertySupported, isBlink
} from '../src/env';

import global from '../src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

function toLowerCase( str ) {
	return str.toLowerCase();
}

describe( 'Env', () => {
	testUtils.createSinonSandbox();

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
			expect( isMac( 'macintosh' ) ).to.be.true;
			expect( isMac( 'foo macintosh bar' ) ).to.be.true;

			expect( isMac( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) ' +
				'Chrome/61.0.3163.100 Safari/537.36'
			) ) ).to.be.true;
		} );

		it( 'returns false for non–macintosh UA strings', () => {
			expect( isMac( '' ) ).to.be.false;
			expect( isMac( 'mac' ) ).to.be.false;
			expect( isMac( 'foo' ) ).to.be.false;
		} );
	} );

	describe( 'isWindows()', () => {
		it( 'returns true for Windows UA strings', () => {
			expect( isWindows( 'windows' ) ).to.be.true;

			expect( isWindows( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0'
			) ) ).to.be.true;

			expect( isWindows( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
			) ) ).to.be.true;
		} );

		it( 'returns false for non-Windows UA strings', () => {
			expect( isWindows( '' ) ).to.be.false;
			expect( isWindows( 'macintosh' ) ).to.be.false;
			expect( isWindows( 'foo' ) ).to.be.false;
		} );
	} );

	describe( 'isGecko()', () => {
		it( 'returns true for Firefox UA strings', () => {
			expect( isGecko( 'gecko/42' ) ).to.be.true;
			expect( isGecko( 'foo gecko/42 bar' ) ).to.be.true;

			expect( isGecko( toLowerCase(
				'mozilla/5.0 (macintosh; intel mac os x 10.13; rv:62.0) gecko/20100101 firefox/62.0'
			) ) ).to.be.true;
		} );

		it( 'returns false for non–Edge UA strings', () => {
			expect( isGecko( '' ) ).to.be.false;
			expect( isGecko( 'foo' ) ).to.be.false;
			expect( isGecko( 'Mozilla' ) ).to.be.false;

			// Chrome
			expect( isGecko( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
			) ) ).to.be.false;
		} );
	} );

	describe( 'isSafari()', () => {
		/* eslint-disable max-len */
		it( 'returns true for Safari UA strings', () => {
			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15'
			) ) ).to.be.true;

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
			) ) ).to.be.true;
		} );

		it( 'returns false for non-Safari UA strings', () => {
			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).to.be.false;

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).to.be.false;

			expect( isSafari( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).to.be.false;
		} );
		/* eslint-enable max-len */
	} );

	describe( 'isiOS()', () => {
		/* eslint-disable max-len */
		it( 'returns true for Safari@iPhone UA string ("Request Mobile Website")', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
			) ) ).to.be.true;
		} );

		it( 'returns true for Safari@iPad UA string ("Request Mobile Website")', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPad; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
			) ) ).to.be.true;
		} );

		it( 'returns true for Safari UA string ("Request Desktop Website")', () => {
			// This is how you tell Safari@Mac from Safari@iOS.
			testUtils.sinon.stub( global.window.navigator, 'maxTouchPoints' ).get( () => 3 );

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
			) ) ).to.be.true;
		} );

		it( 'returns true for Chrome UA string', () => {
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (iPad; CPU OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/95.0.4638.50 Mobile/15E148 Safari/604.1'
			) ) ).to.be.true;
		} );

		it( 'returns false for non-iOS UA strings', () => {
			// Safari on Mac
			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
			) ) ).to.be.false;

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).to.be.false;

			expect( isiOS( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).to.be.false;
		} );
		/* eslint-enable max-len */
	} );

	describe( 'isAndroid()', () => {
		/* eslint-disable max-len */
		it( 'returns true for Android UA strings', () => {
			// Strings taken from https://developer.chrome.com/multidevice/user-agent.
			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev> (KHTML, like Gecko) Chrome/<Chrome Rev> Mobile Safari/<WebKit Rev>'
			) ) ).to.be.true;

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Linux; <Android Version>; <Build Tag etc.>) AppleWebKit/<WebKit Rev>(KHTML, like Gecko) Chrome/<Chrome Rev> Safari/<WebKit Rev>'
			) ) ).to.be.true;
		} );

		it( 'returns false for non-Android UA strings', () => {
			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).to.be.false;

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).to.be.false;

			expect( isAndroid( toLowerCase(
				'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko'
			) ) ).to.be.false;
		} );
		/* eslint-enable max-len */
	} );

	describe( 'isBlink()', () => {
		/* eslint-disable max-len */
		it( 'returns true for Blink UA strings', () => {
			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
			) ) ).to.be.true;

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Linux; Android 7.1; Mi A1 Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
			) ) ).to.be.true;

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.52'
			) ) ).to.be.true;
		} );

		it( 'returns false for non-Blink UA strings', () => {
			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15'
			) ) ).to.be.false;

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
			) ) ).to.be.false;

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
			) ) ).to.be.false;

			expect( isBlink( toLowerCase(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
			) ) ).to.be.false;
		} );
		/* eslint-enable max-len */
	} );

	describe( 'isRegExpUnicodePropertySupported()', () => {
		it( 'should detect accessibility of unicode properties', () => {
			// Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534)
			const testFn = () => ( new RegExp( '\\p{L}', 'u' ) ).test( 'ć' );

			if ( isRegExpUnicodePropertySupported() ) {
				expect( testFn() ).to.be.true;
			} else {
				expect( testFn ).to.throw();
			}
		} );
	} );
} );
