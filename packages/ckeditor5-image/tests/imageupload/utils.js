/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createImageTypeRegExp } from '../../src/imageupload/utils.js';

describe( 'Upload utils', () => {
	describe( 'createImageTypeRegExp()', () => {
		it( 'should return RegExp for testing regular mime type', () => {
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'image/png' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/png' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'png' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with dot', () => {
			expect( createImageTypeRegExp( [ 'vnd.microsoft.icon' ] ).test( 'image/vnd.microsoft.icon' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/vnd.microsoft.icon' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'vnd.microsoft.icon' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with dash', () => {
			expect( createImageTypeRegExp( [ 'x-xbitmap' ] ).test( 'image/x-xbitmap' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/x-xbitmap' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'x-xbitmap' ) ).to.be.false;
		} );

		it( 'should return RegExp for testing mime type with plus', () => {
			expect( createImageTypeRegExp( [ 'svg+xml' ] ).test( 'image/svg+xml' ) ).to.be.true;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/svg+xml' ) ).to.be.false;
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'svg+xml' ) ).to.be.false;
		} );
	} );
} );
