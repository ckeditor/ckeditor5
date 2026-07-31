/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { createImageTypeRegExp } from '../../src/imageupload/utils.js';

describe( 'Upload utils', () => {
	describe( 'createImageTypeRegExp()', () => {
		it( 'should return RegExp for testing regular mime type', () => {
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'image/png' ) ).toBe( true );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/png' ) ).toBe( false );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'png' ) ).toBe( false );
		} );

		it( 'should return RegExp for testing mime type with dot', () => {
			expect( createImageTypeRegExp( [ 'vnd.microsoft.icon' ] ).test( 'image/vnd.microsoft.icon' ) ).toBe( true );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/vnd.microsoft.icon' ) ).toBe( false );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'vnd.microsoft.icon' ) ).toBe( false );
		} );

		it( 'should return RegExp for testing mime type with dash', () => {
			expect( createImageTypeRegExp( [ 'x-xbitmap' ] ).test( 'image/x-xbitmap' ) ).toBe( true );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/x-xbitmap' ) ).toBe( false );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'x-xbitmap' ) ).toBe( false );
		} );

		it( 'should return RegExp for testing mime type with plus', () => {
			expect( createImageTypeRegExp( [ 'svg+xml' ] ).test( 'image/svg+xml' ) ).toBe( true );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'foo/svg+xml' ) ).toBe( false );
			expect( createImageTypeRegExp( [ 'png' ] ).test( 'svg+xml' ) ).toBe( false );
		} );
	} );
} );
