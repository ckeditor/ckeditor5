/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListStyle from '../src/liststyle';
import ListStyleEditing from '../src/liststyleediting';
import ListStyleUI from '../src/liststyleui';

describe( 'ListStyle', () => {
	it( 'should be named', () => {
		expect( ListStyle.pluginName ).to.equal( 'ListStyle' );
	} );

	it( 'should require ListStyleEditing and ListStyleUI', () => {
		expect( ListStyle.requires ).to.deep.equal( [ ListStyleEditing, ListStyleUI ] );
	} );
} );
