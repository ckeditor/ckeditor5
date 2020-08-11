/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { testDataProcessor } from '../_utils/utils';

describe( 'GFMDataProcessor', () => {
	describe( 'text', () => {
		describe( 'urls', () => {
			it( 'should not escape urls', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape escape\\_this',
					'<p>escape_this https://test.com/do_[not]-escape escape_this</p>'
				);
			} );

			it( 'should not escape urls (at start)', () => {
				testDataProcessor(
					'https://test.com/do_[not]-escape escape\\_this',
					'<p>https://test.com/do_[not]-escape escape_this</p>'
				);
			} );

			it( 'should not escape urls (at end)', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape',
					'<p>escape_this https://test.com/do_[not]-escape</p>'
				);
			} );

			[
				'https://test.com/do_[not]-escape',
				'http://test.com/do_[not]-escape',
				'www.test.com/do_[not]-escape'
			].forEach( url => {
				it( `should not escape urls (${ url })`, () => {
					testDataProcessor( url, `<p>${ url }</p>` );
				} );
			} );
		} );
	} );
} );
