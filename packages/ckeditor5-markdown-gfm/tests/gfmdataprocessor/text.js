/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'GFMDataProcessor', () => {
	describe( 'text', () => {
		describe( 'urls', () => {
			it( 'should not escape urls', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape escape\\_this',
					'<p>escape_this https://test.com/do_[not]-escape escape_this</p>'
				);
			} );

			it( 'should not escape urls (data escaped between urls)', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape escape\\_this https://test.com/do_[not]-escape',
					'<p>escape_this https://test.com/do_[not]-escape escape_this https://test.com/do_[not]-escape</p>'
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

			it( 'should not escape urls with matching parenthesis', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar(v2)) escape\\_this',
					'<p>escape_this www.test.com/foobar(v2)) escape_this</p>'
				);
			} );

			it( 'should not escape urls with matching double parenthesis', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar((v2))) escape\\_this',
					'<p>escape_this www.test.com/foobar((v2))) escape_this</p>'
				);
			} );

			it( 'should escape trailing "*""', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar.html\\* escape\\_this',
					'<p>escape_this www.test.com/foobar.html* escape_this</p>'
				);
			} );

			it( 'should escape "*" on both ends of a link', () => {
				testDataProcessor(
					'escape\\_this \\*www.test.com/foobar\\* escape\\_this',
					'<p>escape_this *www.test.com/foobar* escape_this</p>'
				);
			} );

			it( 'should escape all trailing special characters', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar\\*?!).,:\\_~\'" escape\\_this',
					'<p>escape_this www.test.com/foobar*?!).,:_~\'" escape_this</p>'
				);
			} );

			// s/ckeditor5/2
			it( 'should handle invalid urls with repeated characters', () => {
				testDataProcessor(
					'http://\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'',
					'<p>http://\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'</p>'
				);
			} );

			[
				'https://test.com/do_[not]-escape',
				'http://test.com/do_[not]-escape',
				'www.test.com/do_[not]-escape',
				'www.test.com/foobar.html~~',
				'www.test.com/foobar((v2)))',
				'www.test.com/foobar(v2))',
				'www.test.com/foobar((v2)'
			].forEach( url => {
				it( `should not escape urls (${ url })`, () => {
					testDataProcessor( url, `<p>${ url }</p>` );
				} );
			} );
		} );
	} );
} );
