/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Table from '../src/table';
import TableEditing from '../src/tableediting';
import TableUI from '../src/tableui';
import TableSelection from '../src/tableselection';
import TableClipboard from '../src/tableclipboard';
import TableKeyboard from '../src/tablekeyboard';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TableMouse from '../src/tablemouse';

describe( 'Table', () => {
	it( 'requires TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard and Widget', () => {
		expect( Table.requires ).to.deep.equal( [
			TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard, Widget
		] );
	} );

	it( 'has proper name', () => {
		expect( Table.pluginName ).to.equal( 'Table' );
	} );
} );
