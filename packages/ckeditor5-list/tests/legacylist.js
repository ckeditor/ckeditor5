/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { LegacyList } from '../src/legacylist.js';
import { LegacyListEditing } from '../src/legacylist/legacylistediting.js';
import { ListUI } from '../src/list/listui.js';

describe( 'LegacyList', () => {
	it( 'should be named', () => {
		expect( LegacyList.pluginName ).toBe( 'LegacyList' );
	} );

	it( 'should require LegacyListEditing and ListUI', () => {
		expect( LegacyList.requires ).toEqual( [ LegacyListEditing, ListUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyList.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyList.isPremiumPlugin ).toBe( false );
	} );
} );
