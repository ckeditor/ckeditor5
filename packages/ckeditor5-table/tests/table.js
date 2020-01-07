/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Table from '../src/table';
import TableEditing from '../src/tableediting';
import TableUI from '../src/tableui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

describe( 'Table', () => {
	it( 'requires TableEditing, TableUI and Widget', () => {
		expect( Table.requires ).to.deep.equal( [ TableEditing, TableUI, Widget ] );
	} );

	it( 'has proper name', () => {
		expect( Table.pluginName ).to.equal( 'Table' );
	} );
} );
