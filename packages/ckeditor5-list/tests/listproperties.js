/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListProperties from '../src/listproperties.js';
import ListPropertiesEditing from '../src/listproperties/listpropertiesediting.js';
import ListPropertiesUI from '../src/listproperties/listpropertiesui.js';

describe( 'ListProperties', () => {
	it( 'should be named', () => {
		expect( ListProperties.pluginName ).to.equal( 'ListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( ListProperties.requires ).to.deep.equal( [ ListPropertiesEditing, ListPropertiesUI ] );
	} );
} );
