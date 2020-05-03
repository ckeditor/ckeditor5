/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import List from '../src/list';
import ListEditing from '../src/listediting';
import ListUI from '../src/listui';

describe( 'List', () => {
	it( 'should be named', () => {
		expect( List.pluginName ).to.equal( 'List' );
	} );

	it( 'should require ListEditing and ListUI', () => {
		expect( List.requires ).to.deep.equal( [ ListEditing, ListUI ] );
	} );
} );
