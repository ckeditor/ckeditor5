/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Table from '../src/table.js';
import TableEditing from '../src/tableediting.js';
import TableUI from '../src/tableui.js';
import TableSelection from '../src/tableselection.js';
import TableClipboard from '../src/tableclipboard.js';
import TableKeyboard from '../src/tablekeyboard.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import TableMouse from '../src/tablemouse.js';

describe( 'Table', () => {
	it( 'requires TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard and Widget', () => {
		expect( Table.requires ).to.deep.equal( [
			TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard, Widget
		] );
	} );

	it( 'has proper name', () => {
		expect( Table.pluginName ).to.equal( 'Table' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Table.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Table.isPremiumPlugin ).to.be.false;
	} );
} );
