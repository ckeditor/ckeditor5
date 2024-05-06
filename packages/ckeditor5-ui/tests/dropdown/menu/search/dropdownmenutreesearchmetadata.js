/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createTextSearchMetadata,
	normalizeSearchText
} from '../../../../src/dropdown/menu/search/dropdownmenutreesearchmetadata.js';

describe( 'Tree Search Metadata', () => {
	describe( 'normalizeSearchText', () => {
		it( 'should trim spaces and lowercase text', () => {
			expect( normalizeSearchText( '  Helooo   ' ) ).to.be.equal( 'helooo' );
		} );
	} );

	describe( 'createTextSearchMetadata', () => {
		it( 'should fallback to blank string if label is undefined', () => {
			const result = createTextSearchMetadata( );

			expect( result ).to.be.deep.equal( {
				raw: '',
				text: ''
			} );
		} );
	} );
} );
