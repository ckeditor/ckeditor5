/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListProperties from '../src/documentlistproperties';
import DocumentListPropertiesEditing from '../src/documentlistproperties/documentlistpropertiesediting';
import ListPropertiesUI from '../src/listproperties/listpropertiesui';

describe( 'DocumentListProperties', () => {
	it( 'should be named', () => {
		expect( DocumentListProperties.pluginName ).to.equal( 'DocumentListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( DocumentListProperties.requires ).to.deep.equal( [ DocumentListPropertiesEditing, ListPropertiesUI ] );
	} );
} );
