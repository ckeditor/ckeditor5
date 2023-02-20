/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableCellWidthEditing from '../../src/tablecellwidth/tablecellwidthediting';
import TableCellWidthCommand from '../../src/tablecellwidth/commands/tablecellwidthcommand';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertTableCellStyle } from '../_utils/utils';

describe( 'TableCellWidthEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableCellWidthEditing, Paragraph ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCellWidthEditing.pluginName ).to.equal( 'TableCellWidthEditing' );
	} );

	it( 'adds tableCellWidth command', () => {
		expect( editor.commands.get( 'tableCellWidth' ) ).to.be.instanceOf( TableCellWidthCommand );
	} );

	describe( 'cell width', () => {
		it( 'should set proper schema rules', () => {
			expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellWidth' ) ).to.be.true;
		} );

		describe( 'upcast conversion', () => {
			it( 'should upcast width attribute on table cell', () => {
				editor.setData( '<table><tr><td style="width:20px">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				expect( tableCell.getAttribute( 'tableCellWidth' ) ).to.equal( '20px' );
			} );

			// #12426
			it( 'should upcast correct width attribute values on multiple table cells', () => {
				editor.setData(
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td style="width:94px">&nbsp;</td>' +
								'<td style="width:291px">&nbsp;</td>' +
							'</tr>' +
							'<tr>' +
								'<td style="width:94px">&nbsp;</td>' +
								'<td style="width:291px">&nbsp;</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' );

				const tableCell00 = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
				const tableCell01 = model.document.getRoot().getNodeByPath( [ 0, 0, 1 ] );

				expect( tableCell00.getAttribute( 'tableCellWidth' ) ).to.equal( '94px' );
				expect( tableCell01.getAttribute( 'tableCellWidth' ) ).to.equal( '291px' );
			} );
		} );

		describe( 'downcast conversion', () => {
			let tableCell;

			beforeEach( () => {
				setModelData(
					model,
					'<table headingRows="0" headingColumns="0">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>foo</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
			} );

			it( 'should consume converted item tableCellWidth attribute', () => {
				editor.conversion.for( 'downcast' )
					.add( dispatcher => dispatcher.on( 'attribute:tableCellWidth:tableCell', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
					} ) );

				model.change( writer => writer.setAttribute( 'tableCellWidth', '40px', tableCell ) );
			} );

			it( 'should be overridable', () => {
				editor.conversion.for( 'downcast' )
					.add( dispatcher => dispatcher.on( 'attribute:tableCellWidth:tableCell', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } ) );

				model.change( writer => writer.setAttribute( 'tableCellWidth', '40px', tableCell ) );

				assertTableCellStyle( editor, '' );
			} );

			it( 'should downcast tableCellWidth attribute', () => {
				model.change( writer => writer.setAttribute( 'tableCellWidth', '20px', tableCell ) );

				expect(
					editor.getData() ).to.equalMarkup(
					'<figure class="table"><table><tbody><tr><td style="width:20px;">foo</td></tr></tbody></table></figure>'
				);
			} );

			it( 'should downcast tableCellWidth removal', () => {
				model.change( writer => writer.setAttribute( 'tableCellWidth', '1337px', tableCell ) );

				model.change( writer => writer.removeAttribute( 'tableCellWidth', tableCell ) );

				assertTableCellStyle( editor );
			} );

			it( 'should downcast width change', () => {
				model.change( writer => writer.setAttribute( 'tableCellWidth', '1337px', tableCell ) );

				assertTableCellStyle( editor, 'width:1337px;' );

				model.change( writer => writer.setAttribute( 'tableCellWidth', '1410em', tableCell ) );

				assertTableCellStyle( editor, 'width:1410em;' );
			} );
		} );
	} );

	// When default properties are specified, we do not want to put them into the model values if they are equal to the defaults.
	describe( 'default table cell width property', () => {
		let editor, model;

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ TableCellWidthEditing, Paragraph ],
					table: {
						tableCellProperties: {
							defaultProperties: {
								width: '250px'
							}
						}
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'should not upcast the default `width` value from <td>', () => {
			editor.setData( '<table><tr><td style="width:250px">foo</td></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'width' ) ).to.be.undefined;
		} );

		it( 'should not upcast the default `width` value from <th>', () => {
			editor.setData( '<table><tr><th style="width:250px">foo</th></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'width' ) ).to.be.undefined;
		} );
	} );
} );
