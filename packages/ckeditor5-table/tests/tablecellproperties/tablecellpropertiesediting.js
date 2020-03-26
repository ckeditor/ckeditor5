/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableEditing from '../../src/tableediting';
import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting';

import TableCellBorderColorCommand from '../../src/tablecellproperties/commands/tablecellbordercolorcommand';
import TableCellBorderStyleCommand from '../../src/tablecellproperties/commands/tablecellborderstylecommand';
import TableCellBorderWidthCommand from '../../src/tablecellproperties/commands/tablecellborderwidthcommand';
import TableCellHorizontalAlignmentCommand from '../../src/tablecellproperties/commands/tablecellhorizontalalignmentcommand';
import TableCellWidthCommand from '../../src/tablecellproperties/commands/tablecellwidthcommand';
import TableCellHeightCommand from '../../src/tablecellproperties/commands/tablecellheightcommand';
import TableCellVerticalAlignmentCommand from '../../src/tablecellproperties/commands/tablecellverticalalignmentcommand';
import TableCellPaddingCommand from '../../src/tablecellproperties/commands/tablecellpaddingcommand';
import TableCellBackgroundColorCommand from '../../src/tablecellproperties/commands/tablecellbackgroundcolorcommand';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { assertTableCellStyle, assertTRBLAttribute } from '../_utils/utils';

describe( 'table cell properties', () => {
	describe( 'TableCellPropertiesEditing', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ TableCellPropertiesEditing, Paragraph, TableEditing ]
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should have pluginName', () => {
			expect( TableCellPropertiesEditing.pluginName ).to.equal( 'TableCellPropertiesEditing' );
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

		it( 'adds tableCellWidth command', () => {
			expect( editor.commands.get( 'tableCellWidth' ) ).to.be.instanceOf( TableCellWidthCommand );
		} );

		it( 'adds tableCellHeight command', () => {
			expect( editor.commands.get( 'tableCellHeight' ) ).to.be.instanceOf( TableCellHeightCommand );
		} );

		describe( 'border', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'borderColor' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'borderStyle' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'borderWidth' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast border shorthand', () => {
					editor.setData( '<table><tr><td style="border:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', '#f00' );
					assertTRBLAttribute( tableCell, 'borderStyle', 'solid' );
					assertTRBLAttribute( tableCell, 'borderWidth', '1px' );
				} );

				it( 'should upcast border-color shorthand', () => {
					editor.setData( '<table><tr><td style="border-color:#f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', '#f00' );
				} );

				it( 'should upcast border-style shorthand', () => {
					editor.setData( '<table><tr><td style="border-style:ridge">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderStyle', 'ridge' );
				} );

				it( 'should upcast border-width shorthand', () => {
					editor.setData( '<table><tr><td style="border-width:1px">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderWidth', '1px' );
				} );

				it( 'should upcast border-top shorthand', () => {
					editor.setData( '<table><tr><td style="border-top:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', '#f00', null, null, null );
					assertTRBLAttribute( tableCell, 'borderStyle', 'solid', null, null, null );
					assertTRBLAttribute( tableCell, 'borderWidth', '1px', null, null, null );
				} );

				it( 'should upcast border-right shorthand', () => {
					editor.setData( '<table><tr><td style="border-right:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', null, '#f00', null, null );
					assertTRBLAttribute( tableCell, 'borderStyle', null, 'solid', null, null );
					assertTRBLAttribute( tableCell, 'borderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom shorthand', () => {
					editor.setData( '<table><tr><td style="border-bottom:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', null, null, '#f00', null );
					assertTRBLAttribute( tableCell, 'borderStyle', null, null, 'solid', null );
					assertTRBLAttribute( tableCell, 'borderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left shorthand', () => {
					editor.setData( '<table><tr><td style="border-left:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', null, null, null, '#f00' );
					assertTRBLAttribute( tableCell, 'borderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( tableCell, 'borderWidth', null, null, null, '1px' );
				} );

				it( 'should upcast mixed shorthands', () => {
					editor.setData(
						'<table><tr><td style="border-top:1px solid #f00;border-bottom:2em ridge rgba(255,0,0,1)">foo</td></tr></table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', '#f00', null, 'rgba(255, 0, 0, 1)', null );
					assertTRBLAttribute( tableCell, 'borderStyle', 'solid', null, 'ridge', null );
					assertTRBLAttribute( tableCell, 'borderWidth', '1px', null, '2em', null );
				} );

				it( 'should upcast border-top-* styles', () => {
					editor.setData(
						'<table><tr><td style="border-top-width:1px;border-top-style:solid;border-top-color:#f00">foo</td></tr></table>'
					);

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'borderColor', '#f00', null, null, null );
					assertTRBLAttribute( tableCell, 'borderStyle', 'solid', null, null, null );
					assertTRBLAttribute( tableCell, 'borderWidth', '1px', null, null, null );
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

					assertTRBLAttribute( tableCell, 'borderColor', null, '#f00', null, null );
					assertTRBLAttribute( tableCell, 'borderStyle', null, 'solid', null, null );
					assertTRBLAttribute( tableCell, 'borderWidth', null, '1px', null, null );
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

					assertTRBLAttribute( tableCell, 'borderColor', null, null, '#f00', null );
					assertTRBLAttribute( tableCell, 'borderStyle', null, null, 'solid', null );
					assertTRBLAttribute( tableCell, 'borderWidth', null, null, '1px', null );
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

					assertTRBLAttribute( tableCell, 'borderColor', null, null, null, '#f00' );
					assertTRBLAttribute( tableCell, 'borderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( tableCell, 'borderWidth', null, null, null, '1px' );
				} );

				it( 'should allow to be overriden (only border-top consumed)', () => {
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:td', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, {
							styles: [ 'border-top' ]
						} );
					}, { priority: 'high' } ) );

					editor.setData( '<table><tr><td style="border:1px solid blue;">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'borderColor' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'borderStyle' ) ).to.be.undefined;
					expect( tableCell.getAttribute( 'borderWidth' ) ).to.be.undefined;
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

				it( 'should consume converted item borderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderColor:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderColor', '#f00', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderColor:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast borderColor attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderColor', {
						top: '#f00',
						right: '#f00',
						bottom: '#f00',
						left: '#f00'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-bottom:#f00;border-left:#f00;border-right:#f00;border-top:#f00;' );
				} );

				it( 'should downcast borderColor attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderColor', {
						top: '#f00',
						right: 'hsla(0, 100%, 50%, 0.5)',
						bottom: 'deeppink',
						left: 'rgb(255, 0, 0)'
					}, tableCell ) );

					assertTableCellStyle( editor,
						'border-bottom:deeppink;' +
						'border-left:rgb(255, 0, 0);' +
						'border-right:hsla(0, 100%, 50%, 0.5);' +
						'border-top:#f00;'
					);
				} );

				it( 'should consume converted item borderStyle attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderStyle:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderStyle', 'ridge', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderStyle:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderStyle', 'ridge', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast borderStyle attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderStyle', {
						top: 'solid',
						right: 'solid',
						bottom: 'solid',
						left: 'solid'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
				} );

				it( 'should downcast borderStyle attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderStyle', {
						top: 'solid',
						right: 'ridge',
						bottom: 'dotted',
						left: 'dashed'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-bottom:dotted;border-left:dashed;border-right:ridge;border-top:solid;' );
				} );

				it( 'should consume converted item borderWidth attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderWidth:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderWidth', '2px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderWidth:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderWidth', '2px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast borderWidth attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderWidth', {
						top: '42px',
						right: '.1em',
						bottom: '1337rem',
						left: 'thick'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-bottom:1337rem;border-left:thick;border-right:.1em;border-top:42px;' );
				} );

				it( 'should downcast borderWidth attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderWidth', {
						top: '42px',
						right: '42px',
						bottom: '42px',
						left: '42px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'border-bottom:42px;border-left:42px;border-right:42px;border-top:42px;' );
				} );

				it( 'should downcast borderColor, borderStyle and borderWidth attributes together (same top, right, bottom, left)', () => {
					model.change( writer => {
						writer.setAttribute( 'borderColor', {
							top: '#f00',
							right: '#f00',
							bottom: '#f00',
							left: '#f00'
						}, tableCell );

						writer.setAttribute( 'borderStyle', {
							top: 'solid',
							right: 'solid',
							bottom: 'solid',
							left: 'solid'
						}, tableCell );

						writer.setAttribute( 'borderWidth', {
							top: '42px',
							right: '42px',
							bottom: '42px',
							left: '42px'
						}, tableCell );
					} );

					assertTableCellStyle( editor,
						'border-bottom:42px solid #f00;' +
						'border-left:42px solid #f00;' +
						'border-right:42px solid #f00;' +
						'border-top:42px solid #f00;'
					);
				} );

				it(
					'should downcast borderColor, borderStyle and borderWidth attributes together (different top, right, bottom, left)',
					() => {
						model.change( writer => {
							writer.setAttribute( 'borderColor', {
								top: '#f00',
								right: 'hsla(0, 100%, 50%, 0.5)',
								bottom: 'deeppink',
								left: 'rgb(255, 0, 0)'
							}, tableCell );

							writer.setAttribute( 'borderStyle', {
								top: 'solid',
								right: 'ridge',
								bottom: 'dotted',
								left: 'dashed'
							}, tableCell );

							writer.setAttribute( 'borderWidth', {
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
							writer.setAttribute( 'borderColor', {
								top: '#f00',
								right: '#f00',
								bottom: '#f00',
								left: '#f00'
							}, tableCell );

							writer.setAttribute( 'borderStyle', {
								top: 'solid',
								right: 'solid',
								bottom: 'solid',
								left: 'solid'
							}, tableCell );

							writer.setAttribute( 'borderWidth', {
								top: '42px',
								right: '42px',
								bottom: '42px',
								left: '42px'
							}, tableCell );
						} );
					} );

					it( 'should downcast borderColor attribute change', () => {
						model.change( writer => writer.setAttribute( 'borderColor', {
							top: 'deeppink',
							right: 'deeppink',
							bottom: 'deeppink',
							left: 'deeppink'
						}, tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:42px solid deeppink;' +
							'border-left:42px solid deeppink;' +
							'border-right:42px solid deeppink;' +
							'border-top:42px solid deeppink;'
						);
					} );

					it( 'should downcast borderStyle attribute change', () => {
						model.change( writer => writer.setAttribute( 'borderStyle', {
							top: 'ridge',
							right: 'ridge',
							bottom: 'ridge',
							left: 'ridge'
						}, tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:42px ridge #f00;' +
							'border-left:42px ridge #f00;' +
							'border-right:42px ridge #f00;' +
							'border-top:42px ridge #f00;'
						);
					} );

					it( 'should downcast borderWidth attribute change', () => {
						model.change( writer => writer.setAttribute( 'borderWidth', {
							top: 'thick',
							right: 'thick',
							bottom: 'thick',
							left: 'thick'
						}, tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:thick solid #f00;' +
							'border-left:thick solid #f00;' +
							'border-right:thick solid #f00;' +
							'border-top:thick solid #f00;'
						);
					} );

					it( 'should downcast borderColor attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderColor', tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:42px solid;' +
							'border-left:42px solid;' +
							'border-right:42px solid;' +
							'border-top:42px solid;'
						);
					} );

					it( 'should downcast borderStyle attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderStyle', tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:42px #f00;' +
							'border-left:42px #f00;' +
							'border-right:42px #f00;' +
							'border-top:42px #f00;'
						);
					} );

					it( 'should downcast borderWidth attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderWidth', tableCell ) );

						assertTableCellStyle( editor,
							'border-bottom:solid #f00;' +
							'border-left:solid #f00;' +
							'border-right:solid #f00;' +
							'border-top:solid #f00;'
						);
					} );

					it( 'should downcast borderColor, borderStyle and borderWidth attributes removal', () => {
						model.change( writer => {
							writer.removeAttribute( 'borderColor', tableCell );
							writer.removeAttribute( 'borderStyle', tableCell );
							writer.removeAttribute( 'borderWidth', tableCell );
						} );

						assertEqualMarkup(
							editor.getData(),
							'<figure class="table"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>'
						);
					} );
				} );
			} );
		} );

		describe( 'background color', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'backgroundColor' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast background-color', () => {
					editor.setData( '<table><tr><td style="background-color:#f00">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand', () => {
					editor.setData( '<table><tr><td style="background:#f00 center center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand (rbg color value with spaces)', () => {
					editor.setData( '<table><tr><td style="background:rgb(253, 253, 119) center center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'backgroundColor' ) ).to.equal( 'rgb(253, 253, 119)' );
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

				it( 'should consume converted item backgroundColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:backgroundColor:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:backgroundColor:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast backgroundColor', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#f00;' );
				} );

				it( 'should downcast backgroundColor removal', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );

					model.change( writer => writer.removeAttribute( 'backgroundColor', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast backgroundColor change', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#f00;' );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#ba7', tableCell ) );

					assertTableCellStyle( editor, 'background-color:#ba7;' );
				} );
			} );
		} );

		describe( 'horizontal alignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'horizontalAlignment' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should not upcast text-align:left style', () => {
					editor.setData( '<table><tr><td style="text-align:left">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast text-align:right style', () => {
					editor.setData( '<table><tr><td style="text-align:right">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast text-align:center style', () => {
					editor.setData( '<table><tr><td style="text-align:center">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'center' );
				} );

				it( 'should upcast text-align:justify style', () => {
					editor.setData( '<table><tr><td style="text-align:justify">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'justify' );
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

					it( 'should not upcast text-align:right style', () => {
						editor.setData( '<table><tr><td style="text-align:right">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.be.undefined;
					} );

					it( 'should upcast text-align:left style', () => {
						editor.setData( '<table><tr><td style="text-align:left">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'left' );
					} );

					it( 'should upcast text-align:center style', () => {
						editor.setData( '<table><tr><td style="text-align:center">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'center' );
					} );

					it( 'should upcast text-align:justify style', () => {
						editor.setData( '<table><tr><td style="text-align:justify">foo</td></tr></table>' );
						const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

						expect( tableCell.getAttribute( 'horizontalAlignment' ) ).to.equal( 'justify' );
					} );
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

				it( 'should consume converted item horizontalAlignment attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:horizontalAlignment:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'right', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:horizontalAlignment:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'right', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should not downcast horizontalAlignment=left', () => {
					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'left', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast horizontalAlignment=right', () => {
					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'right', tableCell ) );

					assertTableCellStyle( editor, 'text-align:right;' );
				} );

				it( 'should downcast horizontalAlignment=center', () => {
					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'center', tableCell ) );

					assertTableCellStyle( editor, 'text-align:center;' );
				} );

				it( 'should downcast horizontalAlignment=justify', () => {
					model.change( writer => writer.setAttribute( 'horizontalAlignment', 'justify', tableCell ) );

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

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should consume converted item\'s horizontalAlignment attribute', () => {
						editor.conversion.for( 'downcast' )
							.add( dispatcher => dispatcher.on( 'attribute:horizontalAlignment:tableCell', ( evt, data, conversionApi ) => {
								expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
							} ) );

						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'center', tableCell ) );
					} );

					it( 'should be overridable', () => {
						editor.conversion.for( 'downcast' )
							.add( dispatcher => dispatcher.on( 'attribute:horizontalAlignment:tableCell', ( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.item, evt.name );
							}, { priority: 'high' } ) );

						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'center', tableCell ) );

						assertTableCellStyle( editor, '' );
					} );

					it( 'should not downcast horizontalAlignment=right', () => {
						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'right', tableCell ) );

						assertTableCellStyle( editor );
					} );

					it( 'should downcast horizontalAlignment=left', () => {
						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'left', tableCell ) );

						assertTableCellStyle( editor, 'text-align:left;' );
					} );

					it( 'should downcast horizontalAlignment=center', () => {
						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'center', tableCell ) );

						assertTableCellStyle( editor, 'text-align:center;' );
					} );

					it( 'should downcast horizontalAlignment=justify', () => {
						model.change( writer => writer.setAttribute( 'horizontalAlignment', 'justify', tableCell ) );

						assertTableCellStyle( editor, 'text-align:justify;' );
					} );
				} );
			} );
		} );

		describe( 'vertical alignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'verticalAlignment' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast "top" vertical-align', () => {
					editor.setData( '<table><tr><td style="vertical-align:top">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.equal( 'top' );
				} );

				it( 'should upcast "bottom" vertical-align', () => {
					editor.setData( '<table><tr><td style="vertical-align:bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.equal( 'bottom' );
				} );

				it( 'should not upcast "middle" vertical-align', () => {
					editor.setData( '<table><tr><td style="vertical-align:middle">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast "top" valign attribute', () => {
					editor.setData( '<table><tr><td valign="top">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.equal( 'top' );
				} );

				it( 'should upcast "bottom" valign attribute', () => {
					editor.setData( '<table><tr><td valign="bottom">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.equal( 'bottom' );
				} );

				it( 'should not upcast "middle" valign attribute', () => {
					editor.setData( '<table><tr><td valign="middle">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.be.undefined;
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

				it( 'should consume converted item verticalAlignment attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:verticalAlignment:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'verticalAlignment', 'top', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:verticalAlignment:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'verticalAlignment', 'top', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast verticalAlignment', () => {
					model.change( writer => writer.setAttribute( 'verticalAlignment', 'top', tableCell ) );

					assertTableCellStyle( editor, 'vertical-align:top;' );
				} );
			} );
		} );

		describe( 'padding', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'padding' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast padding shorthand', () => {
					editor.setData( '<table><tr><td style="padding:2px 4em">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'padding', '2px', '4em' );
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

				it( 'should consume converted item borderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:padding:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'padding', '1px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:padding:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'padding', '1px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast padding (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'padding', {
						top: '2px',
						right: '2px',
						bottom: '2px',
						left: '2px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'padding:2px;' );
				} );

				it( 'should downcast padding (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'padding', {
						top: '2px',
						right: '3px',
						bottom: '4px',
						left: '5px'
					}, tableCell ) );

					assertTableCellStyle( editor, 'padding:2px 3px 4px 5px;' );
				} );

				it( 'should downcast padding removal', () => {
					model.change( writer => writer.setAttribute( 'padding', '1337px', tableCell ) );

					model.change( writer => writer.removeAttribute( 'padding', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast padding change', () => {
					model.change( writer => writer.setAttribute( 'padding', '1337px', tableCell ) );

					assertTableCellStyle( editor, 'padding:1337px;' );

					model.change( writer => writer.setAttribute( 'padding', '1410em', tableCell ) );

					assertTableCellStyle( editor, 'padding:1410em;' );
				} );
			} );
		} );

		describe( 'cell width', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'width' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast width attribute on table cell', () => {
					editor.setData( '<table><tr><td style="width:20px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'width' ) ).to.equal( '20px' );
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

				it( 'should consume converted item width attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:width:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'width', '40px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:width:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'width', '40px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast width attribute', () => {
					model.change( writer => writer.setAttribute( 'width', '20px', tableCell ) );

					assertEqualMarkup(
						editor.getData(),
						'<figure class="table"><table><tbody><tr><td style="width:20px;">foo</td></tr></tbody></table></figure>'
					);
				} );

				it( 'should downcast width removal', () => {
					model.change( writer => writer.setAttribute( 'width', '1337px', tableCell ) );

					model.change( writer => writer.removeAttribute( 'width', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast width change', () => {
					model.change( writer => writer.setAttribute( 'width', '1337px', tableCell ) );

					assertTableCellStyle( editor, 'width:1337px;' );

					model.change( writer => writer.setAttribute( 'width', '1410em', tableCell ) );

					assertTableCellStyle( editor, 'width:1410em;' );
				} );
			} );
		} );

		describe( 'cell height', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'height' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast height attribute on table cell', () => {
					editor.setData( '<table><tr><td style="height:20px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'height' ) ).to.equal( '20px' );
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

				it( 'should consume converted item height attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:height:tableCell', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'height', '40px', tableCell ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:height:tableCell', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'height', '40px', tableCell ) );

					assertTableCellStyle( editor, '' );
				} );

				it( 'should downcast height attribute', () => {
					model.change( writer => writer.setAttribute( 'height', '20px', tableCell ) );

					assertEqualMarkup(
						editor.getData(),
						'<figure class="table"><table><tbody><tr><td style="height:20px;">foo</td></tr></tbody></table></figure>'
					);
				} );

				it( 'should downcast height removal', () => {
					model.change( writer => writer.setAttribute( 'height', '1337px', tableCell ) );

					model.change( writer => writer.removeAttribute( 'height', tableCell ) );

					assertTableCellStyle( editor );
				} );

				it( 'should downcast height change', () => {
					model.change( writer => writer.setAttribute( 'height', '1337px', tableCell ) );

					assertTableCellStyle( editor, 'height:1337px;' );

					model.change( writer => writer.setAttribute( 'height', '1410em', tableCell ) );

					assertTableCellStyle( editor, 'height:1410em;' );
				} );
			} );
		} );
	} );
} );
