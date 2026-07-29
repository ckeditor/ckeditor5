/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { isDefault, isSupported, supportedOptions, normalizeAlignmentOptions } from '../src/utils.js';

describe( 'utils', () => {
	describe( 'isDefault()', () => {
		it( 'should return true for "left" alignment only (LTR)', () => {
			const locale = {
				contentLanguageDirection: 'ltr'
			};

			expect( isDefault( 'left', locale ) ).toBe( true );
			expect( isDefault( 'right', locale ) ).toBe( false );
			expect( isDefault( 'center', locale ) ).toBe( false );
			expect( isDefault( 'justify', locale ) ).toBe( false );
		} );

		it( 'should return true for "right" alignment only (RTL)', () => {
			const locale = {
				contentLanguageDirection: 'rtl'
			};

			expect( isDefault( 'left', locale ) ).toBe( false );
			expect( isDefault( 'right', locale ) ).toBe( true );
			expect( isDefault( 'center', locale ) ).toBe( false );
			expect( isDefault( 'justify', locale ) ).toBe( false );
		} );
	} );

	describe( 'isSupported()', () => {
		it( 'should return true for supported alignments', () => {
			expect( isSupported( 'left' ) ).toBe( true );
			expect( isSupported( 'right' ) ).toBe( true );
			expect( isSupported( 'center' ) ).toBe( true );
			expect( isSupported( 'justify' ) ).toBe( true );

			expect( isSupported( '' ) ).toBe( false );
			expect( isSupported( 'middle' ) ).toBe( false );
		} );
	} );

	describe( 'supportedOptions', () => {
		it( 'should be set', () => {
			expect( supportedOptions ).toEqual( [ 'left', 'right', 'center', 'justify' ] );
		} );
	} );

	describe( 'normalizeAlignmentOptions', () => {
		it( 'normalizes mixed input into an config array of objects', () => {
			const config = [
				'left',
				{ name: 'right' },
				'center',
				{ name: 'justify' }
			];

			const result = normalizeAlignmentOptions( config );

			expect( result ).toEqual(
				[
					{ 'name': 'left' },
					{ 'name': 'right' },
					{ 'name': 'center' },
					{ 'name': 'justify' }
				]
			);
		} );

		it( 'warns if the name is not recognized', () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const config = [
				'left',
				{ name: 'center1' }
			];

			expect( normalizeAlignmentOptions( config ) ).toEqual( [
				{ name: 'left' }
			] );

			const params = {
				option: { name: 'center1' }
			};

			expect( console.warn ).toHaveBeenCalledOnce();
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringMatching( /^alignment-config-name-not-recognized/ ),
				params,
				expect.any( String ) // Link to the documentation
			);
		} );

		it( 'throws when the className is not defined for all options', () => {
			const config = [
				'left',
				{ name: 'center', className: 'foo-center' }
			];
			let error;

			try {
				normalizeAlignmentOptions( config );
			} catch ( err ) {
				error = err;
			}

			expect( error.constructor ).toBe( CKEditorError );
			expect( error.message ).toMatch( /alignment-config-classnames-are-missing/ );
		} );

		it( 'throws when the name already exists', () => {
			const config = [
				'center',
				{ name: 'center' }
			];
			let error;

			try {
				normalizeAlignmentOptions( config );
			} catch ( err ) {
				error = err;
			}

			expect( error.constructor ).toBe( CKEditorError );
			expect( error.message ).toMatch( /alignment-config-name-already-defined/ );
		} );

		it( 'throws when the className already exists', () => {
			const config = [
				{
					name: 'center',
					className: 'foo-center'
				},
				{
					name: 'justify',
					className: 'foo-center'
				}
			];
			let error;

			try {
				normalizeAlignmentOptions( config );
			} catch ( err ) {
				error = err;
			}

			expect( error.constructor ).toBe( CKEditorError );
			expect( error.message ).toMatch( /alignment-config-classname-already-defined/ );
		} );
	} );
} );
