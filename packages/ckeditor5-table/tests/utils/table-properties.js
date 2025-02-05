/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	getNormalizedDefaultCellProperties,
	getNormalizedDefaultProperties,
	getNormalizedDefaultTableProperties
} from '../../src/utils/table-properties.js';

describe( 'table utils', () => {
	describe( 'table-properties', () => {
		describe( 'getNormalizedDefaultProperties()', () => {
			it( 'should return an object with default properties', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig ) ).to.deep.equal( {
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should return an object with provided configuration and added missing properties', () => {
				const editorConfig = {
					borderStyle: 'dashed',
					width: '500px',
					height: '300px'
				};

				expect( getNormalizedDefaultProperties( editorConfig ) ).to.deep.equal( {
					backgroundColor: '',
					borderColor: '',
					borderStyle: 'dashed',
					borderWidth: '',
					height: '300px',
					width: '500px'
				} );
			} );

			it( 'should add the alignment property', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig, { includeAlignmentProperty: true } ) ).to.deep.equal( {
					alignment: 'center',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should not overwrite the alignment property', () => {
				const editorConfig = {
					alignment: 'left'
				};

				expect( getNormalizedDefaultProperties( editorConfig, { includeAlignmentProperty: true } ) ).to.deep.equal( {
					alignment: 'left',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should add the horizontalAlignment property (left-to-right)', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig, { includeHorizontalAlignmentProperty: true } ) ).to.deep.equal( {
					horizontalAlignment: 'left',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should add the horizontalAlignment property (right-to-left)', () => {
				const editorConfig = {};
				const options = { includeHorizontalAlignmentProperty: true, isRightToLeftContent: true };

				expect( getNormalizedDefaultProperties( editorConfig, options ) ).to.deep.equal( {
					horizontalAlignment: 'right',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should not overwrite the horizontalAlignment property', () => {
				const editorConfig = {
					horizontalAlignment: 'center'
				};

				expect( getNormalizedDefaultProperties( editorConfig, { includeHorizontalAlignmentProperty: true } ) ).to.deep.equal( {
					horizontalAlignment: 'center',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should add the verticalAlignment property', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig, { includeVerticalAlignmentProperty: true } ) ).to.deep.equal( {
					verticalAlignment: 'middle',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should not overwrite the verticalAlignment property', () => {
				const editorConfig = {
					verticalAlignment: 'top'
				};

				expect( getNormalizedDefaultProperties( editorConfig, { includeVerticalAlignmentProperty: true } ) ).to.deep.equal( {
					verticalAlignment: 'top',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should add the alignment padding', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig, { includePaddingProperty: true } ) ).to.deep.equal( {
					padding: '',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );

			it( 'should not overwrite the alignment padding', () => {
				const editorConfig = {
					padding: '10px'
				};

				expect( getNormalizedDefaultProperties( editorConfig, { includePaddingProperty: true } ) ).to.deep.equal( {
					padding: '10px',
					borderStyle: 'none',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: ''
				} );
			} );
		} );

		describe( 'getNormalizedDefaultTableProperties()', () => {
			it( 'should return proper default properties for table', () => {
				expect( getNormalizedDefaultTableProperties() ).to.deep.equal( {
					backgroundColor: '',
					borderStyle: 'double',
					borderColor: 'hsl(0, 0%, 70%)',
					borderWidth: '1px',
					width: '',
					height: ''
				} );
			} );
		} );

		describe( 'getNormalizedDefaultCellProperties()', () => {
			it( 'should return proper default properties for cell', () => {
				expect( getNormalizedDefaultCellProperties() ).to.deep.equal( {
					backgroundColor: '',
					borderStyle: 'solid',
					borderColor: 'hsl(0, 0%, 75%)',
					borderWidth: '1px',
					width: '',
					height: ''
				} );
			} );
		} );
	} );
} );
