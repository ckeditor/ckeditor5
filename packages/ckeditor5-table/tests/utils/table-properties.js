/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getNormalizedDefaultProperties } from '../../src/utils/table-properties';

describe( 'table utils', () => {
	describe( 'table-properties', () => {
		describe( 'getNormalizedDefaultProperties()', () => {
			it( 'should return an object with default properties', () => {
				const editorConfig = {};

				expect( getNormalizedDefaultProperties( editorConfig ) ).to.deep.equal( {
					alignment: 'center',
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
					alignment: 'left',
					borderStyle: 'dashed',
					width: '500px',
					height: '300px'
				};

				expect( getNormalizedDefaultProperties( editorConfig ) ).to.deep.equal( {
					alignment: 'left',
					backgroundColor: '',
					borderColor: '',
					borderStyle: 'dashed',
					borderWidth: '',
					height: '300px',
					width: '500px'
				} );
			} );
		} );
	} );
} );
