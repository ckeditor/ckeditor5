/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { TableEditing } from '../../src/tableediting.js';
import { TableLayoutEditing } from '../../src/tablelayout/tablelayoutediting.js';
import { TableCellPropertiesEditing } from '../../src/tablecellproperties/tablecellpropertiesediting.js';

import { TableCellBorderColorCommand } from '../../src/tablecellproperties/commands/tablecellbordercolorcommand.js';
import { TableCellBorderStyleCommand } from '../../src/tablecellproperties/commands/tablecellborderstylecommand.js';
import { TableCellBorderWidthCommand } from '../../src/tablecellproperties/commands/tablecellborderwidthcommand.js';
import { TableCellHorizontalAlignmentCommand } from '../../src/tablecellproperties/commands/tablecellhorizontalalignmentcommand.js';
import { TableCellHeightCommand } from '../../src/tablecellproperties/commands/tablecellheightcommand.js';
import { TableCellVerticalAlignmentCommand } from '../../src/tablecellproperties/commands/tablecellverticalalignmentcommand.js';
import { TableCellPaddingCommand } from '../../src/tablecellproperties/commands/tablecellpaddingcommand.js';
import { TableCellBackgroundColorCommand } from '../../src/tablecellproperties/commands/tablecellbackgroundcolorcommand.js';

import { _getModelData, _getViewData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { assertTableCellStyle, assertTRBLAttribute, modelTable, viewTable } from '../_utils/utils.js';

describe( 'table cell properties', () => {
	describe( 'TableCellPropertiesEditing', () => {
		let editor, model, schema;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ]
			} );

			model = editor.model;
			schema = model.schema;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should have pluginName', () => {
			expect( TableCellPropertiesEditing.pluginName ).to.equal( 'TableCellPropertiesEditing' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TableCellPropertiesEditing.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
			expect( TableCellPropertiesEditing.isPremiumPlugin ).to.be.true;
		} );

		it( 'should have `licenseFeatureCode` static flag set to `TCP`', () => {
			expect( TableCellPropertiesEditing.licenseFeatureCode ).to.equal( 'TCP' );
		} );

		it( 'should define table.tableCellProperties config', () => {
			const config = editor.config.get( 'table.tableCellProperties' );

			expect( config ).to.be.an( 'object' );
			expect( config ).to.have.property( 'defaultProperties' );
			expect( config.defaultProperties ).to.deep.equal( {} );
		} );

		it( 'adds tableCellBorderColor command', () => {
			expect( editor.commands.get( 'tableCellBorderColor' ) ).to.be.instanceOf( TableCellBorderColorCommand );
		} );

		it( 'adds tableCellBorderStyle command', () => {
			expect( editor.commands.get( 'tableCellBorderStyle' ) ).to.be.instanceOf( TableCellBorderStyleCommand );
		} );

		it( 'adds tableCellBorderWidth command', () => {
			expect( editor.commands.get( 'tableCellBorderWidth' ) ).to.be.instanceOf( TableCellBorderWidthCommand );
		} );

		it( 'adds tableCellAlignment command', () => {
			expect( editor.commands.get( 'tableCellHorizontalAlignment' ) ).to.be.instanceOf( TableCellHorizontalAlignmentCommand );
		} );

		it( 'adds tableCellVerticalAlignment command', () => {
			expect( editor.commands.get( 'tableCellVerticalAlignment' ) ).to.be.instanceOf( TableCellVerticalAlignmentCommand );
		} );

		it( 'adds tableCellPadding command', () => {
			expect( editor.commands.get( 'tableCellPadding' ) ).to.be.instanceOf( TableCellPaddingCommand );
		} );

		it( 'adds tableCellBackgroundColor command', () => {
			expect( editor.commands.get( 'tableCellBackgroundColor' ) ).to.be.instanceOf( TableCellBackgroundColorCommand );
		} );

		it( 'adds tableCellHeight command', () => {
			expect( editor.commands.get( 'tableCellHeight' ) ).to.be.instanceOf( TableCellHeightCommand );
		} );

		describe( 'border', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderColor' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderStyle' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderWidth' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellBorderColor' ).isFormatting ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellBorderStyle' ).isFormatting ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellBorderWidth' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should not upcast border values which are same as default', () => {
					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'border' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="border:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.equal( '#f00' );
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should upcast border shorthand', () => {
					editor.setData( '<table><tr><td style="border:2px dashed #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.equal( '#f00' );
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.equal( 'dashed' );
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.equal( '2px' );
				} );

				it( 'should upcast border-color shorthand', () => {
					editor.setData( '<table><tr><td style="border-color:#f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast border-style shorthand', () => {
					editor.setData( '<table><tr><td style="border-style:ridge">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.equal( 'ridge' );
				} );

				it( 'should upcast border-width shorthand', () => {
					editor.setData( '<table><tr><td style="border-width:3px">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.equal( '3px' );
				} );

				it( 'should upcast border-top shorthand', () => {
					editor.setData( '<table><tr><td style="border-top:2px double #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', '#f00', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', 'double', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', '2px', null, null, null );
				} );

				it( 'should upcast border-right shorthand', () => {
					editor.setData( '<table><tr><td style="border-right:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, '#f00', null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, 'solid', null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom shorthand', () => {
					editor.setData( '<table><tr><td style="border-bottom:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, null, '#f00', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, null, 'solid', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left shorthand', () => {
					editor.setData( '<table><tr><td style="border-left:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, null, null, '#f00' );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, null, null, '1px' );
				} );

				it( 'should upcast mixed shorthands', () => {
					editor.setData(
						'<table><tr><td style="border-top:1px solid #f00;border-bottom:2em ridge rgba(255,0,0,1)">foo</td></tr></table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', '#f00', null, 'rgba(255,0,0,1)', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', 'solid', null, 'ridge', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', '1px', null, '2em', null );
				} );

				it( 'should upcast border-top-* styles', () => {
					editor.setData(
						'<table><tr><td style="border-top-width:1px;border-top-style:solid;border-top-color:#f00">foo</td></tr></table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', '#f00', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', 'solid', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', '1px', null, null, null );
				} );

				it( 'should upcast border-right-* styles', () => {
					editor.setData(
						'<table>' +
							'<tr>' +
								'<td style="border-right-width:1px;border-right-style:solid;border-right-color:#f00">foo</td>' +
							'</tr>' +
						'</table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, '#f00', null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, 'solid', null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom-* styles', () => {
					editor.setData(
						'<table>' +
							'<tr>' +
								'<td style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#f00">foo</td>' +
							'</tr>' +
						'</table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, null, '#f00', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, null, 'solid', null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left-* styles', () => {
					editor.setData(
						'<table>' +
							'<tr>' +
								'<td style="border-left-width:1px;border-left-style:solid;border-left-color:#f00">foo</td>' +
							'</tr>' +
						'</table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', null, null, null, '#f00' );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', null, null, null, '1px' );
				} );

				it( 'should allow to be overriden (only border-top consumed)', () => {
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, {
							styles: [ 'border-top' ]
						} );
					}, { priority: 'high' } ) );

					editor.setData( '<table><tr><td style="border:1px solid blue;">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );

				describe( 'border="0" attribute handling', () => {
					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
							experimentalFlags: {
								upcastTableBorderZeroAttributes: true
							}
						} );

						model = editor.model;
					} );

					it( 'should convert border="0" to tableCellBorderStyle="none" on all table cells', () => {
						editor.setData(
							'<table border="0">' +
								'<tr>' +
									'<td>foo</td>' +
									'<td>bar</td>' +
								'</tr>' +
								'<tr>' +
									'<td>baz</td>' +
									'<td>qux</td>' +
								'</tr>' +
							'</table>'
						);

						const table = model.document.getRoot().getChild( 0 );
						const cells = Array.from( table.getChildren() )
							.flatMap( row => Array.from( row.getChildren() ) );

						expect( cells ).to.have.lengthOf( 4 );

						for ( const cell of cells ) {
							expect( cell.getAttribute( 'tableCellBorderStyle' ) ).to.equal( 'none' );
						}
					} );

					it( 'should not override existing tableCellBorderStyle attribute', () => {
						editor.setData(
							'<table border="0">' +
								'<tr>' +
									'<td style="border-style: dashed;">foo</td>' +
								'</tr>' +
							'</table>'
						);

						const cell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
						expect( cell.getAttribute( 'tableCellBorderStyle' ) ).to.equal( 'dashed' );
					} );
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellBorderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderColor:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderColor', '#f00', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderColor:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellBorderColor attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderColor', {
						top: '#f00',
						right: '#f00',
						bottom: '#f00',
						left: '#f00'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-color:#f00;' );
				} );

				it( 'should downcast tableCellBorderColor attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderColor', {
						top: '#f00',
						right: 'hsla(0, 100%, 50%, 0.5)',
						bottom: 'deeppink',
						left: 'rgb(255, 0, 0)'
					}, tableCell ) );

					assertTableCellStyle( editor,
						'border-bottom-color:deeppink;' +
						'border-left-color:rgb(255, 0, 0);' +
						'border-right-color:hsla(0, 100%, 50%, 0.5);' +
						'border-top-color:#f00;'
					);
				} );

				it( 'should consume converted item tableCellBorderStyle attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderStyle:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderStyle', 'ridge', tableCell ) );
				} );

				it( 'should be overridable for tableCellBorderStyle', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderStyle:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderStyle', 'ridge', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellBorderStyle attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderStyle', {
						top: 'solid',
						right: 'solid',
						bottom: 'solid',
						left: 'solid'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-style:solid;' );
				} );

				it( 'should downcast tableCellBorderStyle attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderStyle', {
						top: 'solid',
						right: 'ridge',
						bottom: 'dotted',
						left: 'dashed'
					}, tableCell ) );

					assertTableCellStyle( editor,
						'border-bottom-style:dotted;' +
						'border-left-style:dashed;' +
						'border-right-style:ridge;' +
						'border-top-style:solid;'
					);
				} );

				it( 'should consume converted item tableCellBorderWidth attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderWidth:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderWidth', '2px', tableCell ) );
				} );

				it( 'should be overridable for tableCellBorderWidth', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBorderWidth:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellBorderWidth', '2px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellBorderWidth attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderWidth', {
						top: '42px',
						right: '.1em',
						bottom: '1337rem',
						left: 'thick'
					}, tableCell ) );

					assertTableCellStyle( editor,
						'border-bottom-width:1337rem;' +
						'border-left-width:thick;' +
						'border-right-width:.1em;' +
						'border-top-width:42px;'
					);
				} );

				it( 'should downcast tableCellBorderWidth attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellBorderWidth', {
						top: '42px',
						right: '42px',
						bottom: '42px',
						left: '42px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-width:42px;' );
				} );

				it( `should downcast tableCellBorderColor, tableCellBorderStyle
					and tableCellBorderWidth attributes together (same top, right, bottom, left)`, () => {
					model.change( writer => {
						writer.setAttribute( 'tableCellBorderColor', {
							top: '#f00',
							right: '#f00',
							bottom: '#f00',
							left: '#f00'
						}, tableCell );

						writer.setAttribute( 'tableCellBorderStyle', {
							top: 'solid',
							right: 'solid',
							bottom: 'solid',
							left: 'solid'
						}, tableCell );

						writer.setAttribute( 'tableCellBorderWidth', {
							top: '42px',
							right: '42px',
							bottom: '42px',
							left: '42px'
						}, tableCell );
					} );

					assertTableCellStyle( editor, 'border:42px solid #f00;' );
				} );

				it(
					`should downcast tableCellBorderColor, tableCellBorderStyle
					and tableCellBorderWidth attributes together (different top, right, bottom, left)`,
					() => {
						model.change( writer => {
							writer.setAttribute( 'tableCellBorderColor', {
								top: '#f00',
								right: 'hsla(0, 100%, 50%, 0.5)',
								bottom: 'deeppink',
								left: 'rgb(255, 0, 0)'
							}, tableCell );

							writer.setAttribute( 'tableCellBorderStyle', {
								top: 'solid',
								right: 'ridge',
								bottom: 'dotted',
								left: 'dashed'
							}, tableCell );

							writer.setAttribute( 'tableCellBorderWidth', {
								top: '42px',
								right: '.1em',
								bottom: '1337rem',
								left: 'thick'
							}, tableCell );
						} );

						assertTableCellStyle( editor,
							'border-bottom:1337rem dotted deeppink;' +
							'border-left:thick dashed rgb(255, 0, 0);' +
							'border-right:.1em ridge hsla(0, 100%, 50%, 0.5);' +
							'border-top:42px solid #f00;'
						);
					}
				);

				describe( 'change attribute', () => {
					beforeEach( () => {
						model.change( writer => {
							writer.setAttribute( 'tableCellBorderColor', {
								top: '#f00',
								right: '#f00',
								bottom: '#f00',
								left: '#f00'
							}, tableCell );

							writer.setAttribute( 'tableCellBorderStyle', {
								top: 'solid',
								right: 'solid',
								bottom: 'solid',
								left: 'solid'
							}, tableCell );

							writer.setAttribute( 'tableCellBorderWidth', {
								top: '42px',
								right: '42px',
								bottom: '42px',
								left: '42px'
							}, tableCell );
						} );
					} );

					it( 'should downcast tableCellBorderColor attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableCellBorderColor', {
							top: 'deeppink',
							right: 'deeppink',
							bottom: 'deeppink',
							left: 'deeppink'
						}, tableCell ) );

						assertTableCellStyle( editor, 'border:42px solid deeppink;' );
					} );

					it( 'should downcast tableCellBorderStyle attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableCellBorderStyle', {
							top: 'ridge',
							right: 'ridge',
							bottom: 'ridge',
							left: 'ridge'
						}, tableCell ) );

						assertTableCellStyle( editor, 'border:42px ridge #f00;' );
					} );

					it( 'should downcast tableCellBorderWidth attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableCellBorderWidth', {
							top: 'thick',
							right: 'thick',
							bottom: 'thick',
							left: 'thick'
						}, tableCell ) );

						assertTableCellStyle( editor, 'border:thick solid #f00;' );
					} );

					it( 'should downcast tableCellBorderColor attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableCellBorderColor', tableCell ) );

						assertTableCellStyle( editor,
							'border-style:solid;' +
							'border-width:42px;'
						);
					} );

					it( 'should downcast tableCellBorderStyle attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableCellBorderStyle', tableCell ) );

						assertTableCellStyle( editor,
							'border-color:#f00;' +
							'border-width:42px;'
						);
					} );

					it( 'should downcast tableCellBorderWidth attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableCellBorderWidth', tableCell ) );

						assertTableCellStyle( editor,
							'border-color:#f00;' +
							'border-style:solid;'
						);
					} );

					it( 'should downcast tableCellBorderColor, tableCellBorderStyle and tableCellBorderWidth attributes removal', () => {
						model.change( writer => {
							writer.removeAttribute( 'tableCellBorderColor', tableCell );
							writer.removeAttribute( 'tableCellBorderStyle', tableCell );
							writer.removeAttribute( 'tableCellBorderWidth', tableCell );
						} );

						expect(
							editor.getData() ).to.equalMarkup(
							'<figure class="table"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>'
						);
					} );
				} );
			} );
		} );

		describe( 'background color', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBackgroundColor' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellBackgroundColor' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast background-color', () => {
					editor.setData( '<table><tr><td style="background-color:#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from tableCellBackgroundColor shorthand', () => {
					editor.setData( '<table><tr><td style="background:#f00 center center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from tableCellBackgroundColor shorthand (rbg color value with spaces)', () => {
					editor.setData( '<table><tr><td style="background:rgb(253, 253, 119) center center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( 'rgb(253, 253, 119)' );
				} );

				it( 'should upcast bgcolor attribute', () => {
					editor.setData( '<table><tr><td bgcolor="#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast background-color style and ignore bgcolor attribute', () => {
					editor.setData( '<table><tr><td bgcolor="blue" style="background-color:#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should consume background color style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									backgroundColor: '#f00'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'background-color' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="background-color:#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellBackgroundColor' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume bgcolor attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									backgroundColor: '#f00'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'bgcolor' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td bgcolor="#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellBackgroundColor' ) ).to.be.false;

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellBackgroundColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBackgroundColor:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#f00', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellBackgroundColor:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellBackgroundColor', () => {
					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#f00;' );
				} );

				it( 'should downcast tableCellBackgroundColor removal', () => {
					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#f00', tableCell ) );

					model.change( writer => writer.removeAttribute( 'tableCellBackgroundColor', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast tableCellBackgroundColor change', () => {
					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#f00;' );

					model.change( writer => writer.setAttribute( 'tableCellBackgroundColor', '#ba7', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#ba7;' );
				} );
			} );
		} );

		describe( 'horizontal alignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellHorizontalAlignment' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellHorizontalAlignment' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast text-align:left style (due to the default value of the property)', () => {
					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'text-align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="text-align:left">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast text-align:right style', () => {
					editor.setData( '<table><tr><td style="text-align:right">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'right' );
				} );

				it( 'should not upcast text-align:center style', () => {
					editor.setData( '<table><tr><td style="text-align:center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
				} );

				it( 'should upcast text-align:justify style', () => {
					editor.setData( '<table><tr><td style="text-align:justify">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
				} );

				describe( 'the [align] attribute', () => {
					it( 'should not upcast the align=left attribute (due to the default value of the property)', () => {
						editor.setData( '<table><tr><td align="left">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
					} );

					it( 'should upcast the align=right attribute', () => {
						editor.setData( '<table><tr><td align="right">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'right' );
					} );

					it( 'should upcast the align=center attribute', () => {
						editor.setData( '<table><tr><td align="center">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
					} );

					it( 'should upcast the align=justify attribute', () => {
						editor.setData( '<table><tr><td align="justify">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
					} );
				} );

				it( 'should consume horizontal alignment style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									horizontalAlignment: 'center'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'text-align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="text-align:center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellHorizontalAlignment' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume align attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									horizontalAlignment: 'center'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td align="center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellHorizontalAlignment' ) ).to.be.false;

					await editor.destroy();
				} );

				describe( 'for RTL content language', () => {
					let editor, model;

					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
							language: 'ar'
						} );

						model = editor.model;
					} );

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should not upcast text-align:right style (due to the default value of the property)', () => {
						editor.setData( '<table><tr><td style="text-align:right">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
					} );

					it( 'should upcast text-align:left style', () => {
						editor.setData( '<table><tr><td style="text-align:left">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'left' );
					} );

					it( 'should not upcast text-align:center style', () => {
						editor.setData( '<table><tr><td style="text-align:center">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
					} );

					it( 'should upcast text-align:justify style', () => {
						editor.setData( '<table><tr><td style="text-align:justify">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
					} );

					describe( 'the [align] attribute', () => {
						it( 'should upcast the align=left attribute', () => {
							editor.setData( '<table><tr><td align="left">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'left' );
						} );

						it( 'should not upcast the align=right attribute  (due to the default value of the property)', () => {
							editor.setData( '<table><tr><td align="right">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
						} );

						it( 'should upcast the align=center attribute', () => {
							editor.setData( '<table><tr><td align="center">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
						} );

						it( 'should upcast the align=justify attribute', () => {
							editor.setData( '<table><tr><td align="justify">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
						} );
					} );
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellHorizontalAlignment attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellHorizontalAlignment:tableCell',
							( evt, data, conversionApi ) => {
								expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
							}
						) );

					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'right', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellHorizontalAlignment:tableCell',
							( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.item, evt.name );
							}, { priority: 'high' }
						) );

					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'right', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellHorizontalAlignment=left', () => {
					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'left', tableCell ) );

					assertTableCellStyle( editor, 'text-align:left;' );
				} );

				it( 'should downcast tableCellHorizontalAlignment=right', () => {
					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'right', tableCell ) );

					assertTableCellStyle( editor, 'text-align:right;' );
				} );

				it( 'should downcast tableCellHorizontalAlignment=center', () => {
					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'center', tableCell ) );

					assertTableCellStyle( editor, 'text-align:center;' );
				} );

				it( 'should downcast tableCellHorizontalAlignment=justify', () => {
					model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'justify', tableCell ) );

					assertTableCellStyle( editor, 'text-align:justify;' );
				} );

				describe( 'for RTL content language', () => {
					let editor, model;

					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
							language: 'ar'
						} );

						model = editor.model;

						_setModelData(
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

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should consume converted item\'s tableCellHorizontalAlignment attribute', () => {
						editor.conversion.for( 'downcast' )
							.add( dispatcher => dispatcher.on( 'attribute:tableCellHorizontalAlignment:tableCell',
								( evt, data, conversionApi ) => {
									expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
								}
							) );

						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'center', tableCell ) );
					} );

					it( 'should be overridable', () => {
						editor.conversion.for( 'downcast' )
							.add( dispatcher => dispatcher.on( 'attribute:tableCellHorizontalAlignment:tableCell',
								( evt, data, conversionApi ) => {
									conversionApi.consumable.consume( data.item, evt.name );
								}, { priority: 'high' }
							) );

						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'center', tableCell ) );

						assertTableCellStyle( editor, '' );
					} );

					it( 'should downcast tableCellHorizontalAlignment=right', () => {
						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'right', tableCell ) );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should downcast tableCellHorizontalAlignment=left', () => {
						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'left', tableCell ) );

						assertTableCellStyle( editor, 'text-align:left;' );
					} );

					it( 'should downcast tableCellHorizontalAlignment=center', () => {
						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'center', tableCell ) );

						assertTableCellStyle( editor, 'text-align:center;' );
					} );

					it( 'should downcast tableCellHorizontalAlignment=justify', () => {
						model.change( writer => writer.setAttribute( 'tableCellHorizontalAlignment', 'justify', tableCell ) );

						assertTableCellStyle( editor, 'text-align:justify;' );
					} );
				} );
			} );
		} );

		describe( 'vertical alignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellVerticalAlignment' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellVerticalAlignment' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast "top" vertical-align', () => {
					editor.setData( '<table><tr><td style="vertical-align:top">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'top' );
				} );

				it( 'should upcast "bottom" vertical-align', () => {
					editor.setData( '<table><tr><td style="vertical-align:bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'bottom' );
				} );

				it( 'should not upcast "middle" vertical-align (due to the default value of the property)', () => {
					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'vertical-align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="vertical-align:middle">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast "top" valign attribute', () => {
					editor.setData( '<table><tr><td valign="top">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'top' );
				} );

				it( 'should upcast "bottom" valign attribute', () => {
					editor.setData( '<table><tr><td valign="bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'bottom' );
				} );

				it( 'should not upcast "middle" valign attribute (due to the default value of the property)', () => {
					editor.setData( '<table><tr><td valign="middle">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should consume vertical alignment style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									verticalAlignment: 'bottom'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'vertical-align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="vertical-align:bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellVerticalAlignment' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume valign attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									verticalAlignment: 'bottom'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'valign' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td valign="bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellVerticalAlignment' ) ).to.be.false;

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellVerticalAlignment attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellVerticalAlignment:tableCell',
							( evt, data, conversionApi ) => {
								expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
							}
						) );

					model.change( writer => writer.setAttribute( 'tableCellVerticalAlignment', 'top', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellVerticalAlignment:tableCell',
							( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.item, evt.name );
							}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellVerticalAlignment', 'top', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellVerticalAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableCellVerticalAlignment', 'top', tableCell ) );

					assertTableCellStyle( editor, 'vertical-align:top;' );
				} );
			} );
		} );

		describe( 'padding', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellPadding' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellPadding' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast padding shorthand', () => {
					editor.setData( '<table><tr><td style="padding:2px 4em">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellPadding', '2px', '4em' );
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellBorderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellPadding:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellPadding', '1px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellPadding:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellPadding', '1px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellPadding (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellPadding', {
						top: '2px',
						right: '2px',
						bottom: '2px',
						left: '2px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'padding:2px;' );
				} );

				it( 'should downcast tableCellPadding (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableCellPadding', {
						top: '2px',
						right: '3px',
						bottom: '4px',
						left: '5px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'padding:2px 3px 4px 5px;' );
				} );

				it( 'should downcast tableCellPadding removal', () => {
					model.change( writer => writer.setAttribute( 'tableCellPadding', '1337px', tableCell ) );

					model.change( writer => writer.removeAttribute( 'tableCellPadding', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast tableCellPadding change', () => {
					model.change( writer => writer.setAttribute( 'tableCellPadding', '1337px', tableCell ) );

					assertTableCellStyle( editor, 'padding:1337px;' );

					model.change( writer => writer.setAttribute( 'tableCellPadding', '1410em', tableCell ) );

					assertTableCellStyle( editor, 'padding:1410em;' );
				} );
			} );
		} );

		describe( 'cell height', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellHeight' ) ).to.be.true;
				expect( model.schema.getAttributeProperties( 'tableCellHeight' ).isFormatting ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast height style on table cell', () => {
					editor.setData( '<table><tr><td style="height:20px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHeight' ) ).to.equal( '20px' );
				} );

				it( 'should upcast height attribute on table cell', () => {
					editor.setData( '<table><tr><td height="20">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHeight' ) ).to.equal( '20px' );
				} );

				it( 'should upcast height style on table cell and ignore height attribute', () => {
					editor.setData( '<table><tr><td height="100" style="height:20px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHeight' ) ).to.equal( '20px' );
				} );

				it( 'should consume height style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									height: '123px'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'height' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td style="height:123px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellHeight' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume height attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									height: '123px'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'height' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table><tr><td height="123">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.hasAttribute( 'tableCellHeight' ) ).to.be.false;

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let tableCell;

				beforeEach( () => {
					_setModelData(
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

				it( 'should consume converted item tableCellHeight attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellHeight:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableCellHeight', '40px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableCellHeight:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableCellHeight', '40px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast tableCellHeight attribute', () => {
					model.change( writer => writer.setAttribute( 'tableCellHeight', '20px', tableCell ) );

					expect(
						editor.getData() ).to.equalMarkup(
						'<figure class="table"><table><tbody><tr><td style="height:20px;">foo</td></tr></tbody></table></figure>'
					);
				} );

				it( 'should downcast tableCellHeight removal', () => {
					model.change( writer => writer.setAttribute( 'tableCellHeight', '1337px', tableCell ) );

					model.change( writer => writer.removeAttribute( 'tableCellHeight', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast tableCellHeight change', () => {
					model.change( writer => writer.setAttribute( 'tableCellHeight', '1337px', tableCell ) );

					assertTableCellStyle( editor, 'height:1337px;' );

					model.change( writer => writer.setAttribute( 'tableCellHeight', '1410em', tableCell ) );

					assertTableCellStyle( editor, 'height:1410em;' );
				} );
			} );
		} );

		describe( 'table layout', () => {
			beforeEach( async () => {
				editor = await VirtualTestEditor.create( {
					plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing, TableLayoutEditing ]
				} );

				model = editor.model;
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			describe( 'upcast', () => {
				describe( 'horizontal alignment', () => {
					it( 'should not upcast text-align:left style (due to the default value of the property)', () => {
						editor.setData( '<table class="layout-table"><tr><td style="text-align:left">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
					} );

					it( 'should upcast text-align:right style', () => {
						editor.setData( '<table class="layout-table"><tr><td style="text-align:right">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'right' );
					} );

					it( 'should upcast text-align:center style', () => {
						editor.setData( '<table class="layout-table"><tr><td style="text-align:center">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
					} );

					it( 'should upcast text-align:justify style', () => {
						editor.setData( '<table class="layout-table"><tr><td style="text-align:justify">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
					} );

					describe( 'the `align` attribute', () => {
						it( 'should not upcast the align="left" attribute (due to the default value of the property)', () => {
							editor.setData( '<table class="layout-table"><tr><td align="left">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
						} );

						it( 'should upcast the align="right" attribute ', () => {
							editor.setData( '<table class="layout-table"><tr><td align="right">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.equal( 'right' );
						} );

						it( 'should upcast the align="center" attribute', () => {
							editor.setData( '<table class="layout-table"><tr><td align="center">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'center' );
						} );

						it( 'should upcast the align="justify" attribute', () => {
							editor.setData( '<table class="layout-table"><tr><td align="justify">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.equal( 'justify' );
						} );
					} );
				} );

				describe( 'vertical alignment', () => {
					it( 'should upcast "top" vertical-align', () => {
						editor.setData( '<table class="layout-table"><tr><td style="vertical-align:top">foo</td></tr></table>' );

						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'top' );
					} );

					it( 'should upcast "bottom" vertical-align', () => {
						editor.setData( '<table class="layout-table"><tr><td style="vertical-align:bottom">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'bottom' );
					} );

					it( 'should not upcast "middle" vertical-align (due to the default value of the property)', () => {
						editor.setData( '<table class="layout-table"><tr><td style="vertical-align:middle">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
					} );

					describe( 'the `valign` attribute', () => {
						it( 'should upcast "top" valign attribute', () => {
							editor.setData( '<table class="layout-table"><tr><td valign="top">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'top' );
						} );

						it( 'should upcast "bottom" valign attribute', () => {
							editor.setData( '<table class="layout-table"><tr><td valign="bottom">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.equal( 'bottom' );
						} );

						it( 'should not upcast "middle" valign attribute (due to the default value of the property)', () => {
							editor.setData( '<table class="layout-table"><tr><td valign="middle">foo</td></tr></table>' );
							const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

							expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
						} );
					} );
				} );
			} );
		} );

		// When default properties are specified, we do not want to put them into the model values if they are equal to the defaults.
		describe( 'default table cell properties', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableCellProperties: {
								defaultProperties: {
									horizontalAlignment: 'left',
									verticalAlignment: 'bottom',
									borderStyle: 'dashed',
									borderColor: '#ff0',
									borderWidth: '2px',
									backgroundColor: '#00f',
									height: '150px',
									padding: '10px'
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						model = editor.model;
					} );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			describe( 'border', () => {
				it( 'should not upcast the default `border` values from <td>', () => {
					editor.setData( '<table><tr><td style="border:2px dashed #ff0">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border` values from <th>', () => {
					editor.setData( '<table><tr><th style="border:2px dashed #ff0">foo</th></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-color` value from <td>', () => {
					editor.setData( '<table><tr><td style="border-color:#ff0">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-style` value from <th>', () => {
					editor.setData( '<table><tr><th style="border-style:dashed">foo</th></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-width` value from <td>', () => {
					editor.setData( '<table><tr><td style="border-width:2px">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-width` value from <th>', () => {
					editor.setData( '<table><tr><th style="border-width:2px">foo</th></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.be.undefined;
				} );
			} );

			describe( 'background color', () => {
				it( 'should not upcast the default `background-color` value from <td>', () => {
					editor.setData( '<table><tr><td style="background-color:#00f">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `background` value from <td>', () => {
					editor.setData( '<table><tr><td style="background:#00f">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;
				} );
				it( 'should not upcast the default `background-color` value from <th>', () => {
					editor.setData( '<table><tr><th style="background-color:#00f">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `background` value from <th>', () => {
					editor.setData( '<table><tr><th style="background:#00f">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;
				} );
			} );

			describe( 'height', () => {
				it( 'should not upcast the default `height` value from <td>', () => {
					editor.setData( '<table><tr><td style="height:150px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'height' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `height` value from <th>', () => {
					editor.setData( '<table><tr><td style="height:150px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'height' ) ).to.be.undefined;
				} );
			} );

			describe( 'padding', () => {
				it( 'should not upcast the default `padding` value from <td>', () => {
					editor.setData( '<table><tr><td style="padding:10px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'padding' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `padding` value from <th>', () => {
					editor.setData( '<table><tr><td style="padding:10px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'padding' ) ).to.be.undefined;
				} );
			} );

			describe( 'tableCellHorizontalAlignment', () => {
				it( 'should not upcast the default value from the style attribute (text-align:left) from <td>', () => {
					editor.setData( '<table><tr><td style="text-align:left">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the style attribute (text-align:left) from <th>', () => {
					editor.setData( '<table><tr><th style="text-align:left">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the align attribute (left) from <td>', () => {
					editor.setData( '<table><tr><td align="left">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the align attribute (left) from <th>', () => {
					editor.setData( '<table><tr><th align="left">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHorizontalAlignment' ) ).to.be.undefined;
				} );
			} );

			describe( 'tableCellVerticalAlignment', () => {
				it( 'should not upcast the default value from the style attribute (vertical-align:bottom;) from <td>', () => {
					editor.setData( '<table><tr><td style="vertical-align:bottom;">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the style attribute (vertical-align:bottom;) from <th>', () => {
					editor.setData( '<table><tr><th style="vertical-align:bottom;">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the valign attribute (bottom) from <td>', () => {
					editor.setData( '<table><tr><td valign="bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the valign attribute (bottom) from <th>', () => {
					editor.setData( '<table><tr><th valign="bottom">foo</th></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellVerticalAlignment' ) ).to.be.undefined;
				} );
			} );
		} );

		describe( 'cell type', () => {
			beforeEach( async () => {
				await editor.destroy();

				editor = await VirtualTestEditor.create( {
					plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ],
					experimentalFlags: {
						tableCellTypeSupport: true
					}
				} );

				model = editor.model;
				schema = model.schema;
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

				it( 'should upcast whole table made of `th` except for first cell', () => {
					editor.setData(
						viewTable( [
							[
								'00',
								{ contents: '01', isHeading: true }
							],
							[
								{ contents: '10', isHeading: true },
								{ contents: '11', isHeading: true }
							]
						] )
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[
								'00',
								{ contents: '01', tableCellType: 'header' }
							],
							[
								{ contents: '10', tableCellType: 'header' },
								{ contents: '11', tableCellType: 'header' }
							]
						] )
					);
				} );
			} );

			describe( 'downcast conversion', () => {
				it( 'should downcast `tableCellType=header` attribute to `th`', () => {
					_setModelData( model,
						modelTable( [
							[ { contents: '00', tableCellType: 'header' }, '01' ],
							[ '10', '11' ]
						] )
					);

					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						viewTable( [
							[ { contents: '00', isHeading: true }, '01' ],
							[ '10', '11' ]
						], { asWidget: true } )
					);
				} );
			} );

			describe( 'editing', () => {
				it( 'should reconvert table cell when `tableCellType` attribute changes to `header`', () => {
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

				it( 'should reconvert table cell when removing `tableCellType` ', () => {
					editor.setData(
						viewTable( [
							[ { contents: '00', isHeading: true }, '01' ],
							[ '10', '11' ]
						] )
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					model.change( writer => {
						writer.removeAttribute( 'tableCellType', tableCell );
					} );

					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						viewTable( [
							[ { contents: '00' }, '01' ],
							[ '10', '11' ]
						], { asWidget: true } )
					);
				} );
			} );

			describe( 'inserting rows / columns', () => {
				describe( 'inserting rows to tables with heading columns', () => {
					it( 'should properly set `tableCellType=header` to first cell of heading columns ' +
							'when appending new row below (single header column)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								'01'
							]
						], { headingColumns: 1 } ) );

						editor.execute( 'insertTableRowBelow' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '00', tableCellType: 'header' },
									'01'
								],
								[
									{ contents: '', tableCellType: 'header' },
									''
								]
							], { headingColumns: 1 } )
						);
					} );

					it( 'should properly set `tableCellType=header` to cells of heading columns ' +
							'when appending new row below (multiple header columns)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								{ contents: '01', tableCellType: 'header' },
								'02'
							]
						], { headingColumns: 2 } ) );

						editor.execute( 'insertTableRowBelow' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '00', tableCellType: 'header' },
									{ contents: '01', tableCellType: 'header' },
									'02'
								],
								[
									{ contents: '', tableCellType: 'header' },
									{ contents: '', tableCellType: 'header' },
									''
								]
							], { headingColumns: 2 } )
						);
					} );

					it( 'should properly set `tableCellType=header` to first cell of heading columns ' +
							'when inserting new row above (single header column)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								'01'
							]
						], { headingColumns: 1 } ) );

						editor.execute( 'insertTableRowAbove' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '', tableCellType: 'header' },
									''
								],
								[
									{ contents: '00', tableCellType: 'header' },
									'01'
								]
							], { headingColumns: 1 } )
						);
					} );

					it( 'should properly set `tableCellType=header` to cells of heading columns ' +
							'when inserting new row above (multiple header columns)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								{ contents: '01', tableCellType: 'header' },
								'02'
							]
						], { headingColumns: 2 } ) );

						editor.execute( 'insertTableRowAbove' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '', tableCellType: 'header' },
									{ contents: '', tableCellType: 'header' },
									''
								],
								[
									{ contents: '00', tableCellType: 'header' },
									{ contents: '01', tableCellType: 'header' },
									'02'
								]
							], { headingColumns: 2 } )
						);
					} );
				} );

				describe( 'inserting columns to tables with heading rows', () => {
					it( 'should properly set `tableCellType=header` to second cell of heading row ' +
							'when appending new column to the right (single header row)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								{ contents: '01', tableCellType: 'header' }
							],
							[ '10', '11' ]
						], { headingRows: 1 } ) );

						editor.execute( 'insertTableColumnRight' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '00', tableCellType: 'header' },
									{ contents: '', tableCellType: 'header' },
									{ contents: '01', tableCellType: 'header' }
								],
								[
									'10',
									'',
									'11'
								]
							], { headingRows: 1 } )
						);
					} );

					it( 'should properly set `tableCellType=header` to cells of heading rows ' +
							'when appending new column to the right (multiple header rows)', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', tableCellType: 'header', isSelected: true },
								{ contents: '01', tableCellType: 'header' }
							],
							[
								{ contents: '10', tableCellType: 'header' },
								{ contents: '11', tableCellType: 'header' }
							],
							[ '20', '21' ]
						], { headingRows: 2 } ) );

						editor.execute( 'insertTableColumnRight' );

						expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
							modelTable( [
								[
									{ contents: '00', tableCellType: 'header' },
									{ contents: '', tableCellType: 'header' },
									{ contents: '01', tableCellType: 'header' }
								],
								[
									{ contents: '10', tableCellType: 'header' },
									{ contents: '', tableCellType: 'header' },
									{ contents: '11', tableCellType: 'header' }
								],
								[
									'20',
									'',
									'21'
								]
							], { headingRows: 2 } )
						);
					} );
				} );
			} );

			describe( 'auto increment of heading attributes', () => {
				it( 'should increment headingRows when the next row is all headers', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[
							{ contents: '10', tableCellType: 'header' },
							{ contents: '11', tableCellType: 'header' }
						],
						[ '20', '21' ]
					] ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableRowHeader' );

					expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[
								{ contents: '00', tableCellType: 'header' },
								{ contents: '01', tableCellType: 'header' }
							],
							[
								{ contents: '10', tableCellType: 'header' },
								{ contents: '11', tableCellType: 'header' }
							],
							[ '20', '21' ]
						], { headingRows: 2 } )
					);
				} );

				it( 'should increment headingColumns when the next column is all headers', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true },
							{ contents: '01', tableCellType: 'header' },
							'02'
						],
						[
							'10',
							{ contents: '11', tableCellType: 'header' },
							'12'
						]
					] ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableColumnHeader' );

					expect( table.getAttribute( 'headingColumns' ) ).to.equal( 2 );
					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[
								{ contents: '00', tableCellType: 'header' },
								{ contents: '01', tableCellType: 'header' },
								'02'
							],
							[
								{ contents: '10', tableCellType: 'header' },
								{ contents: '11', tableCellType: 'header' },
								'12'
							]
						], { headingColumns: 2 } )
					);
				} );

				it( 'should stop incrementing headingRows when a row contains non-header cell', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[
							{ contents: '10', tableCellType: 'header' },
							{ contents: '11', tableCellType: 'header' }
						],
						[
							{ contents: '20', tableCellType: 'header' },
							'21'
						],
						[
							{ contents: '30', tableCellType: 'header' },
							{ contents: '31', tableCellType: 'header' }
						]
					] ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableRowHeader' );

					expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
				} );

				it( 'should stop incrementing headingColumns when a column contains non-header cell', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true },
							{ contents: '01', tableCellType: 'header' },
							{ contents: '02', tableCellType: 'header' },
							{ contents: '03', tableCellType: 'header' }
						],
						[
							'10',
							{ contents: '11', tableCellType: 'header' },
							'12',
							{ contents: '13', tableCellType: 'header' }
						]
					] ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableColumnHeader' );

					expect( table.getAttribute( 'headingColumns' ) ).to.equal( 2 );
				} );

				it( 'should not increment if the next row is not all headers', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[
							{ contents: '10', tableCellType: 'header' },
							'11'
						]
					] ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableRowHeader' );

					expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
				} );

				it( 'should not increment heading attributes when other table attributes change', () => {
					schema.extend( 'table', { allowAttributes: 'foo' } );

					_setModelData( model, modelTable( [
						[ '00', '01' ],
						[
							{ contents: '10', tableCellType: 'header' },
							{ contents: '11', tableCellType: 'header' }
						],
						[ '20', '21' ]
					], { headingRows: 1 } ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					model.change( writer => {
						writer.setAttribute( 'foo', 'bar', table );
					} );

					expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
				} );

				it( 'should not increment headingRows when decreasing it, even ' +
						'if the next row contains headers (due to headingColumns)', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header' }
						],
						[
							{ contents: '10', tableCellType: 'header', isSelected: true },
							{ contents: '11', tableCellType: 'header' }
						]
					], { headingRows: 2, headingColumns: 2 } ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableRowHeader' );

					expect( table.getAttribute( 'headingRows' ) ).to.equal( 1 );
				} );

				it( 'should not increment headingColumns when decreasing it, even ' +
						'if the next column contains headers (due to headingRows)', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', tableCellType: 'header' },
							{ contents: '01', tableCellType: 'header', isSelected: true }
						],
						[
							{ contents: '10', tableCellType: 'header' },
							{ contents: '11', tableCellType: 'header' }
						]
					], { headingRows: 2, headingColumns: 2 } ) );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					editor.execute( 'setTableColumnHeader' );

					expect( table.getAttribute( 'headingColumns' ) ).to.equal( 1 );
				} );
			} );

			describe( 'syncing tableCellType with heading attributes', () => {
				it( 'should set `tableCellType=header` when increasing `headingRows`', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[ '10', '11' ]
					] ) );

					editor.execute( 'setTableRowHeader' );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[
								{ contents: '00', tableCellType: 'header' },
								{ contents: '01', tableCellType: 'header' }
							],
							[ '10', '11' ]
						], { headingRows: 1 } )
					);
				} );

				it( 'should remove `tableCellType` when decreasing `headingRows`', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', tableCellType: 'header', isSelected: true },
							{ contents: '01', tableCellType: 'header' }
						],
						[ '10', '11' ]
					], { headingRows: 1 } ) );

					editor.execute( 'setTableRowHeader' );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] )
					);
				} );

				it( 'should set `tableCellType=header` when increasing `headingColumns`', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[ '10', '11' ]
					] ) );

					editor.execute( 'setTableColumnHeader' );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[
								{ contents: '00', tableCellType: 'header' },
								'01'
							],
							[
								{ contents: '10', tableCellType: 'header' },
								'11'
							]
						], { headingColumns: 1 } )
					);
				} );

				it( 'should remove `tableCellType` when removing `headingColumns`', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', tableCellType: 'header', isSelected: true },
							'01'
						],
						[
							{ contents: '10', tableCellType: 'header' },
							'11'
						]
					], { headingColumns: 1 } ) );

					editor.execute( 'setTableColumnHeader' );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						modelTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] )
					);
				} );
			} );
		} );
	} );
} );
