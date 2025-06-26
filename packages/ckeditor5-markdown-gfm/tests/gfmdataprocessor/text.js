/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testDataProcessor } from '../_utils/utils.js';

describe( 'MarkdownGfmDataProcessor', () => {
	describe( 'text', () => {
		describe( 'urls', () => {
			it( 'should not escape urls', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape escape\\_this',
					'<p>escape_this <a href="https://test.com/do_%5Bnot%5D-escape">https://test.com/do_[not]-escape</a> escape_this</p>',
					'escape\\_this [https://test.com/do\\_\\[not\\]-escape](https://test.com/do_%5Bnot%5D-escape) escape\\_this'
				);
			} );

			it( 'should not escape urls (data escaped between urls)', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape escape\\_this https://test.com/do_[not]-escape',

					'<p>' +
					'escape_this ' +
					'<a href="https://test.com/do_%5Bnot%5D-escape">https://test.com/do_[not]-escape</a>' +
					' escape_this ' +
					'<a href="https://test.com/do_%5Bnot%5D-escape">https://test.com/do_[not]-escape</a>' +
					'</p>',

					'escape\\_this ' +
					'[https://test.com/do\\_\\[not\\]-escape](https://test.com/do_%5Bnot%5D-escape)' +
					' escape\\_this ' +
					'[https://test.com/do\\_\\[not\\]-escape](https://test.com/do_%5Bnot%5D-escape)'
				);
			} );

			it( 'should not escape urls (at start)', () => {
				testDataProcessor(
					'https://test.com/do_[not]-escape escape\\_this',
					'<p><a href="https://test.com/do_%5Bnot%5D-escape">https://test.com/do_[not]-escape</a> escape_this</p>',
					'[https://test.com/do\\_\\[not\\]-escape](https://test.com/do_%5Bnot%5D-escape) escape\\_this'
				);
			} );

			it( 'should not escape urls (at end)', () => {
				testDataProcessor(
					'escape\\_this https://test.com/do_[not]-escape',
					'<p>escape_this <a href="https://test.com/do_%5Bnot%5D-escape">https://test.com/do_[not]-escape</a></p>',
					'escape\\_this [https://test.com/do\\_\\[not\\]-escape](https://test.com/do_%5Bnot%5D-escape)'
				);
			} );

			it( 'should not escape urls with matching parenthesis', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar(v2)) escape\\_this',
					'<p>escape_this <a href="http://www.test.com/foobar(v2)">www.test.com/foobar(v2)</a>) escape_this</p>',
					'escape\\_this [www.test.com/foobar(v2)](http://www.test.com/foobar\\(v2\\))) escape\\_this'
				);
			} );

			it( 'should not escape urls with matching double parenthesis', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar((v2))) escape\\_this',
					'<p>escape_this <a href="http://www.test.com/foobar((v2))">www.test.com/foobar((v2))</a>) escape_this</p>',
					'escape\\_this [www.test.com/foobar((v2))](http://www.test.com/foobar\\(\\(v2\\)\\))) escape\\_this'
				);
			} );

			it( 'should escape trailing "*""', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar.html\\* escape\\_this',
					'<p>escape_this <a href="http://www.test.com/foobar.html%5C">www.test.com/foobar.html\\</a>* escape_this</p>',
					'escape\\_this [www.test.com/foobar.html\\\\](http://www.test.com/foobar.html%5C)\\* escape\\_this'
				);
			} );

			it( 'should escape "*" on both ends of a link', () => {
				testDataProcessor(
					'escape\\_this \\*www.test.com/foobar\\* escape\\_this',
					'<p>escape_this *<a href="http://www.test.com/foobar%5C">www.test.com/foobar\\</a>* escape_this</p>',
					'escape\\_this \\*[www.test.com/foobar\\\\](http://www.test.com/foobar%5C)\\* escape\\_this'
				);
			} );

			it( 'should escape all trailing special characters', () => {
				testDataProcessor(
					'escape\\_this www.test.com/foobar\\*?!).,:\\_~\'" escape\\_this',

					'<p>' +
					'escape_this ' +
					'<a href="http://www.test.com/foobar%5C*?!).,:%5C">www.test.com/foobar\\*?!).,:\\</a>' +
					'_~\'" escape_this</p>',

					'escape\\_this [www.test.com/foobar\\\\\\*?!).,:\\\\](http://www.test.com/foobar%5C*?!\\).,:%5C)\\_\\~\'" escape\\_this'
				);
			} );

			// s/ckeditor5/2
			it( 'should handle invalid urls with repeated characters', () => {
				testDataProcessor(
					'http://\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'',
					'<p>http://\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'</p>',
					'http\\://\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\''
				);
			} );
		} );
	} );
} );
