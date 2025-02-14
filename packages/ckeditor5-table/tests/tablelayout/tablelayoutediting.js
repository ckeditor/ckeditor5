/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';
import Table from '../../src/table.js';
import TableCaption from '../../src/tablecaption.js';
import TableColumnResize from '../../src/tablecolumnresize.js';

describe( 'TableLayoutEditing', () => {
	let editor, model, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableCaption, TableColumnResize, TableLayoutEditing ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableLayoutEditing.pluginName ).to.equal( 'TableLayoutEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableLayoutEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableLayoutEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableType' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'table' ], 'caption' ) ).to.be.false;
	} );

	// TODO: Add more tests.
} );
