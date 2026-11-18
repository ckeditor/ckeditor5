/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { TableRowResize } from '../../src/tablerowresize.js';
import { TableRowResizeEditing } from '../../src/tablerowresize/tablerowresizeediting.js';
import { TableCellHeightEditing } from '../../src/tablecellheight/tablecellheightediting.js';
import { TableHeightEditing } from '../../src/tableheight/tableheightediting.js';

describe( 'TableRowResize', () => {
	it( 'should have a proper name', () => {
		expect( TableRowResize.pluginName ).toBe( 'TableRowResize' );
	} );

	it( 'should require TableRowResizeEditing, TableCellHeightEditing and TableHeightEditing', () => {
		expect( TableRowResize.requires ).toEqual( [ TableRowResizeEditing, TableCellHeightEditing, TableHeightEditing ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableRowResize.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableRowResize.isPremiumPlugin ).toBe( false );
	} );
} );
