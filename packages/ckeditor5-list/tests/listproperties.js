/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { ListProperties } from '../src/listproperties.js';
import { ListPropertiesEditing } from '../src/listproperties/listpropertiesediting.js';
import { ListPropertiesUI } from '../src/listproperties/listpropertiesui.js';

describe( 'ListProperties', () => {
	it( 'should be named', () => {
		expect( ListProperties.pluginName ).toBe( 'ListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( ListProperties.requires ).toEqual( [ ListPropertiesEditing, ListPropertiesUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListProperties.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListProperties.isPremiumPlugin ).toBe( false );
	} );
} );
