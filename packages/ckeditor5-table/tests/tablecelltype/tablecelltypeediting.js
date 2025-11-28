/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { TableCellTypeEditing } from '../../src/tablecelltype/tablecelltypeediting.js';
import { TableCellTypeCommand } from '../../src/tablecelltype/commands/tablecelltypecommand.js';
import { TableEditing } from '../../src/tableediting.js';
import { modelTable, viewTable } from '../_utils/utils.js';

describe( 'TableCellTypeEditing', () => {
	let editor, model, schema;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableCellTypeEditing, Paragraph ],
			experimentalFlags: {
				tableCellTypeSupport: true
			}
		} );

		model = editor.model;
		schema = model.schema;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCellTypeEditing.pluginName ).to.equal( 'TableCellTypeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableCellTypeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableCellTypeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require `TableEditing` plugin', () => {
		expect( TableCellTypeEditing.requires ).to.include( TableEditing );
	} );

	it( 'adds tableCellType command', () => {
		expect( editor.commands.get( 'tableCellType' ) ).to.be.instanceOf( TableCellTypeCommand );
	} );

	describe( 'schema', () => {
		it( 'should register tableCellType attribute in the schema', () => {
			expect( schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellType' ) ).to.be.true;
		} );

		it( 'should register tableCellType attribute as a formatting attribute', () => {
			expect( schema.getAttributeProperties( 'tableCellType' ).isFormatting ).to.be.true;
		} );
	} );

	describe( 'upcast conversion', () => {
		it( 'should upcast `th` to `tableCellType=header` attribute', () => {
			editor.setData(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				] )
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				modelTable( [
					[ { contents: '00', tableCellType: 'header' }, '01' ],
					[ '10', '11' ]
				] )
			);
		} );
	} );

	describe( 'editing', () => {
		it( 'should reconvert table cell when tableCellType attribute changes', () => {
			editor.setData(
				viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] )
			);

			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			model.change( writer => {
				writer.setAttribute( 'tableCellType', 'header', tableCell );
			} );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				viewTable( [
					[ { contents: '00', isHeading: true }, '01' ],
					[ '10', '11' ]
				], { asWidget: true } )
			);
		} );
	} );
} );
