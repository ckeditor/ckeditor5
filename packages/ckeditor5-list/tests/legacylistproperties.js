/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LegacyListProperties from '../src/legacylistproperties.js';
import LegacyListPropertiesEditing from '../src/legacylistproperties/legacylistpropertiesediting.js';
import ListPropertiesUI from '../src/listproperties/listpropertiesui.js';

describe( 'LegacyListProperties', () => {
	it( 'should be named', () => {
		expect( LegacyListProperties.pluginName ).to.equal( 'LegacyListProperties' );
	} );

	it( 'should require LegacyListPropertiesEditing and ListPropertiesUI', () => {
		expect( LegacyListProperties.requires ).to.deep.equal( [ LegacyListPropertiesEditing, ListPropertiesUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyListProperties.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyListProperties.isPremiumPlugin ).to.be.false;
	} );
} );
