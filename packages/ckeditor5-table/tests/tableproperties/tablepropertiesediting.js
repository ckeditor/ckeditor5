/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableEditing from '../../src/tableediting';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting';

import TableBorderColorCommand from '../../src/tableproperties/commands/tablebordercolorcommand';
import TableBorderStyleCommand from '../../src/tableproperties/commands/tableborderstylecommand';
import TableBorderWidthCommand from '../../src/tableproperties/commands/tableborderwidthcommand';
import TableAlignmentCommand from '../../src/tableproperties/commands/tablealignmentcommand';
import TableWidthCommand from '../../src/tableproperties/commands/tablewidthcommand';
import TableHeightCommand from '../../src/tableproperties/commands/tableheightcommand';
import TableBackgroundColorCommand from '../../src/tableproperties/commands/tablebackgroundcolorcommand';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { assertTableStyle, assertTRBLAttribute } from '../_utils/utils';

describe( 'table properties', () => {
	describe( 'TablePropertiesEditing', () => {
		let editor, model;

		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ TablePropertiesEditing, Paragraph, TableEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;

					model = editor.model;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'should have pluginName', () => {
			expect( TablePropertiesEditing.pluginName ).to.equal( 'TablePropertiesEditing' );
		} );

		it( 'adds tableBorderColor command', () => {
			expect( editor.commands.get( 'tableBorderColor' ) ).to.be.instanceOf( TableBorderColorCommand );
		} );

		it( 'adds tableBorderStyle command', () => {
			expect( editor.commands.get( 'tableBorderStyle' ) ).to.be.instanceOf( TableBorderStyleCommand );
		} );

		it( 'adds tableBorderWidth command', () => {
			expect( editor.commands.get( 'tableBorderWidth' ) ).to.be.instanceOf( TableBorderWidthCommand );
		} );

		it( 'adds tableAlignment command', () => {
			expect( editor.commands.get( 'tableAlignment' ) ).to.be.instanceOf( TableAlignmentCommand );
		} );

		it( 'adds tableWidth command', () => {
			expect( editor.commands.get( 'tableWidth' ) ).to.be.instanceOf( TableWidthCommand );
		} );

		it( 'adds tableHeight command', () => {
			expect( editor.commands.get( 'tableHeight' ) ).to.be.instanceOf( TableHeightCommand );
		} );

		it( 'adds tableBackgroundColor command', () => {
			expect( editor.commands.get( 'tableBackgroundColor' ) ).to.be.instanceOf( TableBackgroundColorCommand );
		} );

		describe( 'border', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderColor' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderStyle' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderWidth' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast border shorthand', () => {
					editor.setData( '<table style="border:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', '#f00' );
					assertTRBLAttribute( table, 'borderStyle', 'solid' );
					assertTRBLAttribute( table, 'borderWidth', '1px' );
				} );

				it( 'should upcast border-color shorthand', () => {
					editor.setData( '<table style="border-color:#f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', '#f00' );
				} );

				it( 'should upcast border-style shorthand', () => {
					editor.setData( '<table style="border-style:ridge"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderStyle', 'ridge' );
				} );

				it( 'should upcast border-width shorthand', () => {
					editor.setData( '<table style="border-width:1px"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderWidth', '1px' );
				} );

				it( 'should upcast border-top shorthand', () => {
					editor.setData( '<table style="border-top:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', '#f00', null, null, null );
					assertTRBLAttribute( table, 'borderStyle', 'solid', null, null, null );
					assertTRBLAttribute( table, 'borderWidth', '1px', null, null, null );
				} );

				it( 'should upcast border-right shorthand', () => {
					editor.setData( '<table style="border-right:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, '#f00', null, null );
					assertTRBLAttribute( table, 'borderStyle', null, 'solid', null, null );
					assertTRBLAttribute( table, 'borderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom shorthand', () => {
					editor.setData( '<table style="border-bottom:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, null, '#f00', null );
					assertTRBLAttribute( table, 'borderStyle', null, null, 'solid', null );
					assertTRBLAttribute( table, 'borderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left shorthand', () => {
					editor.setData( '<table style="border-left:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, null, null, '#f00' );
					assertTRBLAttribute( table, 'borderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( table, 'borderWidth', null, null, null, '1px' );
				} );

				it( 'should upcast border-top-* styles', () => {
					editor.setData(
						'<table style="border-top-width:1px;border-top-style:solid;border-top-color:#f00"><tr><td>foo</td></tr></table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', '#f00', null, null, null );
					assertTRBLAttribute( table, 'borderStyle', 'solid', null, null, null );
					assertTRBLAttribute( table, 'borderWidth', '1px', null, null, null );
				} );

				it( 'should upcast border-right-* styles', () => {
					editor.setData(
						'<table style="border-right-width:1px;border-right-style:solid;border-right-color:#f00">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, '#f00', null, null );
					assertTRBLAttribute( table, 'borderStyle', null, 'solid', null, null );
					assertTRBLAttribute( table, 'borderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom-* styles', () => {
					editor.setData(
						'<table style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#f00">' +
						'<tr>' +
						'<td>foo</td>' +
						'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, null, '#f00', null );
					assertTRBLAttribute( table, 'borderStyle', null, null, 'solid', null );
					assertTRBLAttribute( table, 'borderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left-* styles', () => {
					editor.setData(
						'<table style="border-left-width:1px;border-left-style:solid;border-left-color:#f00"><tr><td>foo</td></tr></table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', null, null, null, '#f00' );
					assertTRBLAttribute( table, 'borderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( table, 'borderWidth', null, null, null, '1px' );
				} );

				// https://github.com/ckeditor/ckeditor5/issues/6177
				it( 'should upcast tables with nested tables in their cells', () => {
					editor.setData( '<table style="border:1px solid red">' +
						'<tr>' +
							'<td>parent:00</td>' +
							'<td>' +
								'<table style="border:1px solid green"><tr><td>child:00</td></tr></table>' +
							'</td>' +
						'</tr>' +
					'</table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'borderColor', 'red' );
					assertTRBLAttribute( table, 'borderStyle', 'solid' );
					assertTRBLAttribute( table, 'borderWidth', '1px' );
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item borderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderColor:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderColor', '#f00', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderColor:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderColor', '#f00', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast borderColor attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderColor', {
						top: '#f00',
						right: '#f00',
						bottom: '#f00',
						left: '#f00'
					}, table ) );

					assertTableStyle( editor, 'border-bottom:#f00;border-left:#f00;border-right:#f00;border-top:#f00;' );
				} );

				it( 'should downcast borderColor attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderColor', {
						top: '#f00',
						right: 'hsla(0, 100%, 50%, 0.5)',
						bottom: 'deeppink',
						left: 'rgb(255, 0, 0)'
					}, table ) );

					assertTableStyle( editor,
						'border-bottom:deeppink;' +
						'border-left:rgb(255, 0, 0);' +
						'border-right:hsla(0, 100%, 50%, 0.5);' +
						'border-top:#f00;'
					);
				} );

				it( 'should consume converted item borderStyle attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderStyle:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderStyle', 'solid', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderStyle:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderStyle', 'solid', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast borderStyle attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderStyle', {
						top: 'solid',
						right: 'solid',
						bottom: 'solid',
						left: 'solid'
					}, table ) );

					assertTableStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
				} );

				it( 'should downcast borderStyle attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderStyle', {
						top: 'solid',
						right: 'ridge',
						bottom: 'dotted',
						left: 'dashed'
					}, table ) );

					assertTableStyle( editor, 'border-bottom:dotted;border-left:dashed;border-right:ridge;border-top:solid;' );
				} );

				it( 'should consume converted item borderWidth attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderWidth:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'borderWidth', '2px', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:borderWidth:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'borderWidth', '2px', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast borderWidth attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderWidth', {
						top: '42px',
						right: '.1em',
						bottom: '1337rem',
						left: 'thick'
					}, table ) );

					assertTableStyle( editor, 'border-bottom:1337rem;border-left:thick;border-right:.1em;border-top:42px;' );
				} );

				it( 'should downcast borderWidth attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'borderWidth', {
						top: '42px',
						right: '42px',
						bottom: '42px',
						left: '42px'
					}, table ) );

					assertTableStyle( editor, 'border-bottom:42px;border-left:42px;border-right:42px;border-top:42px;' );
				} );

				it( 'should downcast borderColor, borderStyle and borderWidth attributes together (same top, right, bottom, left)', () => {
					model.change( writer => {
						writer.setAttribute( 'borderColor', {
							top: '#f00',
							right: '#f00',
							bottom: '#f00',
							left: '#f00'
						}, table );

						writer.setAttribute( 'borderStyle', {
							top: 'solid',
							right: 'solid',
							bottom: 'solid',
							left: 'solid'
						}, table );

						writer.setAttribute( 'borderWidth', {
							top: '42px',
							right: '42px',
							bottom: '42px',
							left: '42px'
						}, table );
					} );

					assertTableStyle( editor,
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
							}, table );

							writer.setAttribute( 'borderStyle', {
								top: 'solid',
								right: 'ridge',
								bottom: 'dotted',
								left: 'dashed'
							}, table );

							writer.setAttribute( 'borderWidth', {
								top: '42px',
								right: '.1em',
								bottom: '1337rem',
								left: 'thick'
							}, table );
						} );

						assertTableStyle( editor,
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
							}, table );

							writer.setAttribute( 'borderStyle', {
								top: 'solid',
								right: 'solid',
								bottom: 'solid',
								left: 'solid'
							}, table );

							writer.setAttribute( 'borderWidth', {
								top: '42px',
								right: '42px',
								bottom: '42px',
								left: '42px'
							}, table );
						} );
					} );

					it( 'should downcast borderColor attribute change', () => {
						model.change( writer => writer.setAttribute( 'borderColor', {
							top: 'deeppink',
							right: 'deeppink',
							bottom: 'deeppink',
							left: 'deeppink'
						}, table ) );

						assertTableStyle( editor,
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
						}, table ) );

						assertTableStyle( editor,
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
						}, table ) );

						assertTableStyle( editor,
							'border-bottom:thick solid #f00;' +
							'border-left:thick solid #f00;' +
							'border-right:thick solid #f00;' +
							'border-top:thick solid #f00;'
						);
					} );

					it( 'should downcast borderColor attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderColor', table ) );

						assertTableStyle( editor,
							'border-bottom:42px solid;' +
							'border-left:42px solid;' +
							'border-right:42px solid;' +
							'border-top:42px solid;'
						);
					} );

					it( 'should downcast borderStyle attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderStyle', table ) );

						assertTableStyle( editor,
							'border-bottom:42px #f00;' +
							'border-left:42px #f00;' +
							'border-right:42px #f00;' +
							'border-top:42px #f00;'
						);
					} );

					it( 'should downcast borderWidth attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'borderWidth', table ) );

						assertTableStyle( editor,
							'border-bottom:solid #f00;' +
							'border-left:solid #f00;' +
							'border-right:solid #f00;' +
							'border-top:solid #f00;'
						);
					} );

					it( 'should downcast borderColor, borderStyle and borderWidth attributes removal', () => {
						model.change( writer => {
							writer.removeAttribute( 'borderColor', table );
							writer.removeAttribute( 'borderStyle', table );
							writer.removeAttribute( 'borderWidth', table );
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
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'backgroundColor' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast background-color', () => {
					editor.setData( '<table style="background-color:#f00"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand', () => {
					editor.setData( '<table style="background:#f00 center center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand (rbg color value with spaces)', () => {
					editor.setData( '<table style="background:rgb(253, 253, 119) center center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'backgroundColor' ) ).to.equal( 'rgb(253, 253, 119)' );
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:backgroundColor:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:backgroundColor:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast backgroundColor', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

					assertTableStyle( editor, 'background-color:#f00;' );
				} );

				it( 'should downcast backgroundColor removal', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

					model.change( writer => writer.removeAttribute( 'backgroundColor', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast backgroundColor change', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

					assertTableStyle( editor, 'background-color:#f00;' );

					model.change( writer => writer.setAttribute( 'backgroundColor', '#ba7', table ) );

					assertTableStyle( editor, 'background-color:#ba7;' );
				} );
			} );
		} );

		describe( 'width', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'width' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast width from <table>', () => {
					editor.setData( '<table style="width:1337px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'width' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast width from <figure>', () => {
					editor.setData( '<figure style="width:1337px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'width' ) ).to.equal( '1337px' );
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:width:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'width', '400px', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:width:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'width', '400px', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast width', () => {
					model.change( writer => writer.setAttribute( 'width', '1337px', table ) );

					assertTableStyle( editor, null, 'width:1337px;' );
				} );

				it( 'should downcast width removal', () => {
					model.change( writer => writer.setAttribute( 'width', '1337px', table ) );

					model.change( writer => writer.removeAttribute( 'width', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast width change', () => {
					model.change( writer => writer.setAttribute( 'width', '1337px', table ) );

					assertTableStyle( editor, null, 'width:1337px;' );

					model.change( writer => writer.setAttribute( 'width', '1410em', table ) );

					assertTableStyle( editor, null, 'width:1410em;' );
				} );
			} );
		} );

		describe( 'height', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'height' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast height from <table>', () => {
					editor.setData( '<table style="height:1337px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'height' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast height from <figure>', () => {
					editor.setData( '<figure style="height:1337px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'height' ) ).to.equal( '1337px' );
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should downcast height', () => {
					model.change( writer => writer.setAttribute( 'height', '1337px', table ) );

					assertTableStyle( editor, null, 'height:1337px;' );
				} );

				it( 'should downcast height removal', () => {
					model.change( writer => writer.setAttribute( 'height', '1337px', table ) );

					model.change( writer => writer.removeAttribute( 'height', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast height change', () => {
					model.change( writer => writer.setAttribute( 'height', '1337px', table ) );

					assertTableStyle( editor, null, 'height:1337px;' );

					model.change( writer => writer.setAttribute( 'height', '1410em', table ) );

					assertTableStyle( editor, null, 'height:1410em;' );
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:height:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'height', '400px', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:height:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'height', '400px', table ) );

					assertTableStyle( editor, '' );
				} );
			} );
		} );

		describe( 'alignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'alignment' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast style="float:right" to right value', () => {
					editor.setData( '<table style="float:right"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'alignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast style="float:left;" to left value', () => {
					editor.setData( '<table style="float:left;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'alignment' ) ).to.equal( 'left' );
				} );

				it( 'should upcast align=right attribute', () => {
					editor.setData( '<table align="right"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'alignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast align=left attribute', () => {
					editor.setData( '<table align="left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'alignment' ) ).to.equal( 'left' );
				} );

				it( 'should discard align=center attribute', () => {
					editor.setData( '<table align="center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'alignment' ) ).to.be.undefined;
				} );

				it( 'should discard align=justify attribute', () => {
					editor.setData( '<table align="justify"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'alignment' ) ).to.be.false;
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:alignment:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:alignment:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'highest' } ) );

					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast "right" alignment', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );
				} );

				it( 'should downcast "left" alignment', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );
				} );

				it( 'should not downcast "center" alignment', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'center', table ) );

					assertTableStyle( editor, null, null );
				} );

				it( 'should downcast changed alignment (left -> right)', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );

					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );
				} );

				it( 'should downcast changed alignment (right -> left)', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );

					model.change( writer => writer.setAttribute( 'alignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );
				} );

				it( 'should downcast removed alignment (from left)', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );

					model.change( writer => writer.removeAttribute( 'alignment', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast removed alignment (from right)', () => {
					model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );

					model.change( writer => writer.removeAttribute( 'alignment', table ) );

					assertTableStyle( editor );
				} );
			} );
		} );

		function createEmptyTable() {
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

			return model.document.getRoot().getNodeByPath( [ 0 ] );
		}
	} );
} );
