/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListProperties from '../src/listproperties';
import ListPropertiesEditing from '../src/listproperties/listpropertiesediting';
import ListPropertiesUI from '../src/listproperties/listpropertiesui';

describe( 'ListProperties', () => {
	it( 'should be named', () => {
		expect( ListProperties.pluginName ).to.equal( 'ListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( ListProperties.requires ).to.deep.equal( [ ListPropertiesEditing, ListPropertiesUI ] );
	} );
} );
