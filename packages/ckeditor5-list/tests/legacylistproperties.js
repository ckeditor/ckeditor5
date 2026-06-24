/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { LegacyListProperties } from '../src/legacylistproperties.js';
import { LegacyListPropertiesEditing } from '../src/legacylistproperties/legacylistpropertiesediting.js';
import { ListPropertiesUI } from '../src/listproperties/listpropertiesui.js';

describe( 'LegacyListProperties', () => {
	it( 'should be named', () => {
		expect( LegacyListProperties.pluginName ).toBe( 'LegacyListProperties' );
	} );

	it( 'should require LegacyListPropertiesEditing and ListPropertiesUI', () => {
		expect( LegacyListProperties.requires ).toEqual( [ LegacyListPropertiesEditing, ListPropertiesUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyListProperties.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyListProperties.isPremiumPlugin ).toBe( false );
	} );
} );
