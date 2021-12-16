/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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

		it( 'adds tableCellWidth command', () => {
			expect( editor.commands.get( 'tableCellWidth' ) ).to.be.instanceOf( TableCellWidthCommand );
		} );

		it( 'adds tableCellHeight command', () => {
			expect( editor.commands.get( 'tableCellHeight' ) ).to.be.instanceOf( TableCellHeightCommand );
		} );

		describe( 'border', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderColor' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderStyle' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellBorderWidth' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast border shorthand', () => {
					editor.setData( '<table><tr><td style="border:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderColor' ) ).to.equal( '#f00' );
					expect( tableCell.getAttribute( 'tableCellBorderStyle' ) ).to.equal( 'solid' );
					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.equal( '1px' );
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
					editor.setData( '<table><tr><td style="border-width:1px">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellBorderWidth' ) ).to.equal( '1px' );
				} );

				it( 'should upcast border-top shorthand', () => {
					editor.setData( '<table><tr><td style="border-top:1px solid #f00">foo</td></tr></table>' );

					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', '#f00', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderStyle', 'solid', null, null, null );
					assertTRBLAttribute( tableCell, 'tableCellBorderWidth', '1px', null, null, null );
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

					assertTRBLAttribute( tableCell, 'tableCellBorderColor', '#f00', null, 'rgba(255, 0, 0, 1)', null );
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
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast text-align:left style (due to the default value of the property)', () => {
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

		describe( 'cell height', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellHeight' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast height attribute on table cell', () => {
					editor.setData( '<table><tr><td style="height:20px">foo</td></tr></table>' );
					const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

					expect( tableCell.getAttribute( 'tableCellHeight' ) ).to.equal( '20px' );
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
									width: '250px',
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

			afterEach( () => {
				editor.destroy();
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

			describe( 'width', () => {
				it( 'should upcast the default `width` value from <td>', () => {
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
	} );
} );
