/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CKEditorError } from 'ckeditor5/src/utils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { isDefault, isSupported, supportedOptions, normalizeAlignmentOptions } from '../src/utils.js';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

	describe( 'isDefault()', () => {
		it( 'should return true for "left" alignment only (LTR)', () => {
			const locale = {
				contentLanguageDirection: 'ltr'
			};

			expect( isDefault( 'left', locale ) ).to.be.true;
			expect( isDefault( 'right', locale ) ).to.be.false;
			expect( isDefault( 'center', locale ) ).to.be.false;
			expect( isDefault( 'justify', locale ) ).to.be.false;
		} );

		it( 'should return true for "right" alignment only (RTL)', () => {
			const locale = {
				contentLanguageDirection: 'rtl'
			};

			expect( isDefault( 'left', locale ) ).to.be.false;
			expect( isDefault( 'right', locale ) ).to.be.true;
			expect( isDefault( 'center', locale ) ).to.be.false;
			expect( isDefault( 'justify', locale ) ).to.be.false;
		} );
	} );

	describe( 'isSupported()', () => {
		it( 'should return true for supported alignments', () => {
			expect( isSupported( 'left' ) ).to.be.true;
			expect( isSupported( 'right' ) ).to.be.true;
			expect( isSupported( 'center' ) ).to.be.true;
			expect( isSupported( 'justify' ) ).to.be.true;

			expect( isSupported( '' ) ).to.be.false;
			expect( isSupported( 'middle' ) ).to.be.false;
		} );
	} );

	describe( 'supportedOptions', () => {
		it( 'should be set', () => {
			expect( supportedOptions ).to.deep.equal( [ 'left', 'right', 'center', 'justify' ] );
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

			expect( result ).to.deep.equal(
				[
					{ 'name': 'left' },
					{ 'name': 'right' },
					{ 'name': 'center' },
					{ 'name': 'justify' }
				]
			);
		} );

		it( 'warns if the name is not recognized', () => {
			testUtils.sinon.stub( console, 'warn' );

			const config = [
				'left',
				{ name: 'center1' }
			];

			expect( normalizeAlignmentOptions( config ) ).to.deep.equal( [
				{ name: 'left' }
			] );

			const params = {
				option: { name: 'center1' }
			};

			sinon.assert.calledOnce( console.warn );
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( /^alignment-config-name-not-recognized/ ),
				params,
				sinon.match.string // Link to the documentation
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

			expect( error.constructor ).to.equal( CKEditorError );
			expect( error ).to.match( /alignment-config-classnames-are-missing/ );
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

			expect( error.constructor ).to.equal( CKEditorError );
			expect( error ).to.match( /alignment-config-name-already-defined/ );
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

			expect( error.constructor ).to.equal( CKEditorError );
			expect( error ).to.match( /alignment-config-classname-already-defined/ );
		} );
	} );
} );
