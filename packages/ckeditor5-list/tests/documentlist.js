/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentList from '../src/documentlist.js';
import ListUI from '../src/list/listui.js';
import DocumentListEditing from '../src/documentlist/documentlistediting.js';

describe( 'DocumentList', () => {
	it( 'should be named', () => {
		expect( DocumentList.pluginName ).to.equal( 'DocumentList' );
	} );

	it( 'should require DocumentListEditing and ListUI', () => {
		expect( DocumentList.requires ).to.deep.equal( [ DocumentListEditing, ListUI ] );
	} );
} );
