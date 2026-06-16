/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';

import { SelectAll } from '../src/selectall.js';
import { SelectAllEditing } from '../src/selectallediting.js';
import { SelectAllUI } from '../src/selectallui.js';

describe( 'SelectAll', () => {
	it( 'should require SelectAllEditing and SelectAllUI', () => {
		expect( SelectAll.requires ).toEqual( [ SelectAllEditing, SelectAllUI ] );
	} );

	it( 'should be named', () => {
		expect( SelectAll.pluginName ).toBe( 'SelectAll' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAll.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAll.isPremiumPlugin ).toBe( false );
	} );
} );
