/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListProperties from '../src/liststyle';
import ListPropertiesEditing from '../src/listpropertiesediting';
import ListPropertiesUI from '../src/listpropertiesui';

describe( 'ListProperties', () => {
	it( 'should be named', () => {
		expect( ListProperties.pluginName ).to.equal( 'ListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( ListProperties.requires ).to.deep.equal( [ ListPropertiesEditing, ListPropertiesUI ] );
	} );
} );
