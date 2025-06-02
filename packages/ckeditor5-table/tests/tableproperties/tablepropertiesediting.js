/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { ImageBlockEditing, ImageResizeEditing } from '@ckeditor/ckeditor5-image';

import TableEditing from '../../src/tableediting.js';
import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting.js';

import TableBorderColorCommand from '../../src/tableproperties/commands/tablebordercolorcommand.js';
import TableBorderStyleCommand from '../../src/tableproperties/commands/tableborderstylecommand.js';
import TableBorderWidthCommand from '../../src/tableproperties/commands/tableborderwidthcommand.js';
import TableAlignmentCommand from '../../src/tableproperties/commands/tablealignmentcommand.js';
import TableWidthCommand from '../../src/tableproperties/commands/tablewidthcommand.js';
import TableHeightCommand from '../../src/tableproperties/commands/tableheightcommand.js';
import TableBackgroundColorCommand from '../../src/tableproperties/commands/tablebackgroundcolorcommand.js';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { assertTableStyle, assertTRBLAttribute } from '../_utils/utils.js';

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

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should have pluginName', () => {
			expect( TablePropertiesEditing.pluginName ).to.equal( 'TablePropertiesEditing' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TablePropertiesEditing.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( TablePropertiesEditing.isPremiumPlugin ).to.be.false;
		} );

		describe( 'init()', () => {
			it( 'should define table.tableProperties config', () => {
				const config = editor.config.get( 'table.tableProperties' );

				expect( config ).to.be.an( 'object' );
				expect( config ).to.have.property( 'defaultProperties' );
				expect( config.defaultProperties ).to.deep.equal( {} );
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
		} );

		describe( 'border', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableBorderColor' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableBorderStyle' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableBorderWidth' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should not upcast border shorthand when values are the same as default values', () => {
					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'border' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="border:1px double hsl(0, 0%, 70%)"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderStyle' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should upcast border shorthand', () => {
					editor.setData( '<table style="border:2px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.equal( '#f00' );
					expect( table.getAttribute( 'tableBorderStyle' ) ).to.equal( 'solid' );
					expect( table.getAttribute( 'tableBorderWidth' ) ).to.equal( '2px' );
				} );

				it( 'should upcast border-color shorthand', () => {
					editor.setData( '<table style="border-color:#f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast border-style shorthand', () => {
					editor.setData( '<table style="border-style:ridge"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderStyle' ) ).to.equal( 'ridge' );
				} );

				it( 'should upcast border-width shorthand', () => {
					editor.setData( '<table style="border-width:3px"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderWidth' ) ).to.equal( '3px' );
				} );

				it( 'should upcast border-top shorthand', () => {
					editor.setData( '<table style="border-top:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', '#f00', null, null, null );
					assertTRBLAttribute( table, 'tableBorderStyle', 'solid', null, null, null );
					assertTRBLAttribute( table, 'tableBorderWidth', '1px', null, null, null );
				} );

				it( 'should upcast border-right shorthand', () => {
					editor.setData( '<table style="border-right:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', null, '#f00', null, null );
					assertTRBLAttribute( table, 'tableBorderStyle', null, 'solid', null, null );
					assertTRBLAttribute( table, 'tableBorderWidth', null, '1px', null, null );
				} );

				it( 'should upcast border-bottom shorthand', () => {
					editor.setData( '<table style="border-bottom:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', null, null, '#f00', null );
					assertTRBLAttribute( table, 'tableBorderStyle', null, null, 'solid', null );
					assertTRBLAttribute( table, 'tableBorderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left shorthand', () => {
					editor.setData( '<table style="border-left:1px solid #f00"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', null, null, null, '#f00' );
					assertTRBLAttribute( table, 'tableBorderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( table, 'tableBorderWidth', null, null, null, '1px' );
				} );

				it( 'should upcast border-top-* styles', () => {
					editor.setData(
						'<table style="border-top-width:1px;border-top-style:solid;border-top-color:#f00"><tr><td>foo</td></tr></table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', '#f00', null, null, null );
					assertTRBLAttribute( table, 'tableBorderStyle', 'solid', null, null, null );
					assertTRBLAttribute( table, 'tableBorderWidth', '1px', null, null, null );
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

					assertTRBLAttribute( table, 'tableBorderColor', null, '#f00', null, null );
					assertTRBLAttribute( table, 'tableBorderStyle', null, 'solid', null, null );
					assertTRBLAttribute( table, 'tableBorderWidth', null, '1px', null, null );
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

					assertTRBLAttribute( table, 'tableBorderColor', null, null, '#f00', null );
					assertTRBLAttribute( table, 'tableBorderStyle', null, null, 'solid', null );
					assertTRBLAttribute( table, 'tableBorderWidth', null, null, '1px', null );
				} );

				it( 'should upcast border-left-* styles', () => {
					editor.setData(
						'<table style="border-left-width:1px;border-left-style:solid;border-left-color:#f00"><tr><td>foo</td></tr></table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					assertTRBLAttribute( table, 'tableBorderColor', null, null, null, '#f00' );
					assertTRBLAttribute( table, 'tableBorderStyle', null, null, null, 'solid' );
					assertTRBLAttribute( table, 'tableBorderWidth', null, null, null, '1px' );
				} );

				describe( 'nested tables', () => {
					// https://github.com/ckeditor/ckeditor5/issues/6177.
					it( 'should upcast tables with nested tables in their cells', () => {
						editor.setData(
							'<table style="border:2px solid red">' +
								'<tr>' +
									'<td>parent:00</td>' +
									'<td>' +
										'<table style="border:2px solid green"><tr><td>child:00</td></tr></table>' +
									'</td>' +
								'</tr>' +
							'</table>'
						);

						const table = model.document.getRoot().getNodeByPath( [ 0 ] );

						expect( table.getAttribute( 'tableBorderColor' ) ).to.equal( 'red' );
						expect( table.getAttribute( 'tableBorderStyle' ) ).to.equal( 'solid' );
						expect( table.getAttribute( 'tableBorderWidth' ) ).to.equal( '2px' );

						// Also check the entire structure of the model.
						// Previously the test was too loose in that regard.
						expect( getModelData( editor.model ) ).to.equal(
							'[<table tableBorderColor="red" tableBorderStyle="solid" tableBorderWidth="2px">' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>' +
											'parent:00' +
										'</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
										'<table tableBorderColor="green" tableBorderStyle="solid" tableBorderWidth="2px">' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph>' +
														'child:00' +
													'</paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>]'
						);
					} );

					// https://github.com/ckeditor/ckeditor5/issues/8393.
					it( 'should not throw error - inner cell with border style', () => {
						expect( () => {
							editor.setData(
								'<table>' +
									'<tbody>' +
										'<tr>' +
											'<td> ' +
												'<table>' +
													'<tbody>' +
														'<tr>' +
															'<td style="border-bottom: 0 solid #fff;"></td>' +
														'</tr>' +
													'</tbody>' +
												'</table>' +
											'</td>' +
										'</tr>' +
									'</tbody>' +
								'</table>'
							);
						} ).not.to.throw();

						expect( getModelData( editor.model ) ).to.equal(
							'[<table>' +
								'<tableRow>' +
									'<tableCell>' +
										'<table>' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph></paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>]'
						);
					} );

					// https://github.com/ckeditor/ckeditor5/issues/8393.
					it( 'should not throw error - inner empty table with border style', () => {
						expect( () => {
							editor.setData(
								'<table>' +
									'<tbody>' +
										'<tr>' +
											'<td> ' +
												'<table style="border-bottom: 0 solid #fff;"></table>' +
											'</td>' +
										'</tr>' +
									'</tbody>' +
								'</table>'
							);
						} ).not.to.throw();

						expect( getModelData( editor.model ) ).to.equal(
							'[<table>' +
								'<tableRow>' +
									'<tableCell>' +
										'<table ' +
											'tableBorderColor="{"bottom":"#fff"}" ' +
											'tableBorderStyle="{"bottom":"solid"}" ' +
											'tableBorderWidth="{"bottom":"0"}"' +
										'>' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph></paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>]'
						);
					} );

					// https://github.com/ckeditor/ckeditor5/issues/8393.
					it( 'should not throw error - no tables allowed in an element', () => {
						// Conversion will create a merged text node out of all the text contents,
						// including the one in elements not allowed by schema in this scope.
						// Let's make sure that upcasting will not try to use model that got processed this way.
						expect( () => {
							editor.setData(
								'<figure class="image">' +
									'<img src="X">' +
									'<figcaption>' +
										'<table>' +
											'<tr>' +
												'<td>parent:00</td>' +
												'<td>' +
													'<table style="border:1px solid green">' +
														'<tr>' +
															'<td>child:00</td>' +
														'</tr>' +
													'</table>' +
												'</td>' +
											'</tr>' +
										'</table>' +
									'</figcaption>' +
								'</figure>'
							);
						} ).not.to.throw();

						expect( getModelData( editor.model ) ).to.equal(
							'[<table>' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>parent:00</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
											'<table tableBorderColor="green" tableBorderStyle="solid">' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph>child:00</paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
							'</table>]'
						);
					} );

					describe( 'nested tables forbidden by custom rule', () => {
						// Nested tables are supported since https://github.com/ckeditor/ckeditor5/issues/3232, so let's check
						// if the editor will not blow up in case nested tables are forbidden by custom scheme rule.
						beforeEach( () => {
							model.schema.addChildCheck( ( context, childDefinition ) => {
								if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
									return false;
								}
							} );
						} );

						it( 'should upcast tables with nested tables in their cells', () => {
							editor.setData(
								'<table style="border:2px solid red">' +
									'<tr>' +
										'<td>parent:00</td>' +
										'<td>' +
											'<table style="border:2px solid green"><tr><td>child:00</td></tr></table>' +
										'</td>' +
									'</tr>' +
								'</table>'
							);

							const table = model.document.getRoot().getNodeByPath( [ 0 ] );

							expect( table.getAttribute( 'tableBorderColor' ) ).to.equal( 'red' );
							expect( table.getAttribute( 'tableBorderStyle' ) ).to.equal( 'solid' );
							expect( table.getAttribute( 'tableBorderWidth' ) ).to.equal( '2px' );

							expect( getModelData( editor.model ) ).to.equal(
								'[<table tableBorderColor="red" tableBorderStyle="solid" tableBorderWidth="2px">' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>' +
												'parent:00' +
											'</paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph>' +
												'child:00' +
											'</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>]'
							);
						} );

						// https://github.com/ckeditor/ckeditor5/issues/8393.
						it( 'should not throw error - inner cell with border style', () => {
							expect( () => {
								editor.setData(
									'<table>' +
										'<tbody>' +
											'<tr>' +
												'<td> ' +
													'<table>' +
														'<tbody>' +
															'<tr>' +
																'<td style="border-bottom: 0 solid #fff;"></td>' +
															'</tr>' +
														'</tbody>' +
													'</table>' +
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>'
								);
							} ).not.to.throw();

							expect( getModelData( editor.model ) ).to.equal(
								'[<table>' +
									'<tableRow>' +
										'<tableCell>' +
										'<paragraph></paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>]'
							);
						} );

						// https://github.com/ckeditor/ckeditor5/issues/8393.
						it( 'should not throw error - inner empty table with border style', () => {
							expect( () => {
								editor.setData(
									'<table>' +
										'<tbody>' +
											'<tr>' +
												'<td> ' +
													'<table style="border-bottom: 0 solid #fff;"></table>' +
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>'
								);
							} ).not.to.throw();

							expect( getModelData( editor.model ) ).to.equal(
								'[<table>' +
									'<tableRow>' +
										'<tableCell>' +
										'<paragraph></paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>]'
							);
						} );

						// https://github.com/ckeditor/ckeditor5/issues/8393.
						it( 'should not throw error - no tables allowed in an element', () => {
							// Conversion will create a merged text node out of all the text contents,
							// including the one in elements not allowed by schema in this scope.
							// Let's make sure that upcasting will not try to use model that got processed this way.
							expect( () => {
								editor.setData(
									'<figure class="image">' +
										'<img src="X">' +
										'<figcaption>' +
											'<table>' +
												'<tr>' +
													'<td>parent:00</td>' +
													'<td>' +
														'<table style="border:1px solid green">' +
															'<tr>' +
																'<td>child:00</td>' +
															'</tr>' +
														'</table>' +
													'</td>' +
												'</tr>' +
											'</table>' +
										'</figcaption>' +
									'</figure>'
								);
							} ).not.to.throw();

							expect( getModelData( editor.model ) ).to.equal(
								'[<table>' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>parent:00</paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph>child:00</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
								'</table>]'
							);
						} );
					} );
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item tableBorderColor attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderColor:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableBorderColor', '#f00', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderColor:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableBorderColor', '#f00', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast tableBorderColor attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderColor', {
						top: '#f00',
						right: '#f00',
						bottom: '#f00',
						left: '#f00'
					}, table ) );

					assertTableStyle( editor, 'border-color:#f00;' );
				} );

				it( 'should downcast tableBorderColor attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderColor', {
						top: '#f00',
						right: 'hsla(0, 100%, 50%, 0.5)',
						bottom: 'deeppink',
						left: 'rgb(255, 0, 0)'
					}, table ) );

					assertTableStyle( editor,
						'border-bottom-color:deeppink;' +
						'border-left-color:rgb(255, 0, 0);' +
						'border-right-color:hsla(0, 100%, 50%, 0.5);' +
						'border-top-color:#f00;'
					);
				} );

				it( 'should consume converted item tableBorderStyle attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderStyle:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'solid', table ) );
				} );

				it( 'should be overridable for tableBorderStyle', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderStyle:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'solid', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast tableBorderStyle attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', {
						top: 'solid',
						right: 'solid',
						bottom: 'solid',
						left: 'solid'
					}, table ) );

					assertTableStyle( editor, 'border-style:solid;' );
				} );

				it( 'should downcast tableBorderStyle attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', {
						top: 'solid',
						right: 'ridge',
						bottom: 'dotted',
						left: 'dashed'
					}, table ) );

					assertTableStyle( editor,
						'border-bottom-style:dotted;' +
						'border-left-style:dashed;' +
						'border-right-style:ridge;' +
						'border-top-style:solid;'
					);
				} );

				it( 'should consume converted item tableBorderWidth attribute', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderWidth:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableBorderWidth', '2px', table ) );
				} );

				it( 'should be overridable for tableBorderWidth', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBorderWidth:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableBorderWidth', '2px', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast tableBorderWidth attribute (same top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderWidth', {
						top: '42px',
						right: '.1em',
						bottom: '1337rem',
						left: 'thick'
					}, table ) );

					assertTableStyle(
						editor,
						'border-bottom-width:1337rem;border-left-width:thick;border-right-width:.1em;border-top-width:42px;'
					);
				} );

				it( 'should downcast tableBorderWidth attribute (different top, right, bottom, left)', () => {
					model.change( writer => writer.setAttribute( 'tableBorderWidth', {
						top: '42px',
						right: '42px',
						bottom: '42px',
						left: '42px'
					}, table ) );

					assertTableStyle( editor, 'border-width:42px;' );
				} );

				it( `should downcast
				tableBorderColor,
				tableBorderStyle
				and tableBorderWidth attributes together (same top, right, bottom, left)`, () => {
					model.change( writer => {
						writer.setAttribute( 'tableBorderColor', {
							top: '#f00',
							right: '#f00',
							bottom: '#f00',
							left: '#f00'
						}, table );

						writer.setAttribute( 'tableBorderStyle', {
							top: 'solid',
							right: 'solid',
							bottom: 'solid',
							left: 'solid'
						}, table );

						writer.setAttribute( 'tableBorderWidth', {
							top: '42px',
							right: '42px',
							bottom: '42px',
							left: '42px'
						}, table );
					} );

					assertTableStyle( editor, 'border:42px solid #f00;' );
				} );

				it(
					`should downcast
					tableBorderColor,
					tableBorderStyle
					and tableBorderWidth attributes together (different top, right, bottom, left)`,
					() => {
						model.change( writer => {
							writer.setAttribute( 'tableBorderColor', {
								top: '#f00',
								right: 'hsla(0, 100%, 50%, 0.5)',
								bottom: 'deeppink',
								left: 'rgb(255, 0, 0)'
							}, table );

							writer.setAttribute( 'tableBorderStyle', {
								top: 'solid',
								right: 'ridge',
								bottom: 'dotted',
								left: 'dashed'
							}, table );

							writer.setAttribute( 'tableBorderWidth', {
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
							writer.setAttribute( 'tableBorderColor', {
								top: '#f00',
								right: '#f00',
								bottom: '#f00',
								left: '#f00'
							}, table );

							writer.setAttribute( 'tableBorderStyle', {
								top: 'solid',
								right: 'solid',
								bottom: 'solid',
								left: 'solid'
							}, table );

							writer.setAttribute( 'tableBorderWidth', {
								top: '42px',
								right: '42px',
								bottom: '42px',
								left: '42px'
							}, table );
						} );
					} );

					it( 'should downcast tableBorderColor attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableBorderColor', {
							top: 'deeppink',
							right: 'deeppink',
							bottom: 'deeppink',
							left: 'deeppink'
						}, table ) );

						assertTableStyle( editor, 'border:42px solid deeppink;' );
					} );

					it( 'should downcast tableBorderStyle attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableBorderStyle', {
							top: 'ridge',
							right: 'ridge',
							bottom: 'ridge',
							left: 'ridge'
						}, table ) );

						assertTableStyle( editor, 'border:42px ridge #f00;' );
					} );

					it( 'should downcast tableBorderWidth attribute change', () => {
						model.change( writer => writer.setAttribute( 'tableBorderWidth', {
							top: 'thick',
							right: 'thick',
							bottom: 'thick',
							left: 'thick'
						}, table ) );

						assertTableStyle( editor, 'border:thick solid #f00;' );
					} );

					it( 'should downcast tableBorderColor attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableBorderColor', table ) );

						assertTableStyle( editor,
							'border-style:solid;' +
							'border-width:42px;'
						);
					} );

					it( 'should downcast tableBorderStyle attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableBorderStyle', table ) );

						assertTableStyle( editor,
							'border-color:#f00;' +
							'border-width:42px;'

						);
					} );

					it( 'should downcast tableBorderWidth attribute removal', () => {
						model.change( writer => writer.removeAttribute( 'tableBorderWidth', table ) );

						assertTableStyle( editor,
							'border-color:#f00;' +
							'border-style:solid;'
						);
					} );

					it( 'should downcast tableBorderColor, tableBorderStyle and tableBorderWidth attributes removal', () => {
						model.change( writer => {
							writer.removeAttribute( 'tableBorderColor', table );
							writer.removeAttribute( 'tableBorderStyle', table );
							writer.removeAttribute( 'tableBorderWidth', table );
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
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableBackgroundColor' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast background-color', () => {
					editor.setData( '<table style="background-color:#f00"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand', () => {
					editor.setData( '<table style="background:#f00 center center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should upcast from background shorthand (rbg color value with spaces)', () => {
					editor.setData( '<table style="background:rgb(253, 253, 119) center center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( 'rgb(253, 253, 119)' );
				} );

				it( 'should upcast bgcolor attribute', () => {
					editor.setData( '<table bgcolor="#f00"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( '#f00' );
				} );

				it( 'should consume background color style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									backgroundColor: '#f00'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'background-color' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="background-color:#f00"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableBackgroundColor' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume bgcolor attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									backgroundColor: '#f00'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'bgcolor' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table bgcolor="#f00"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableBackgroundColor' ) ).to.be.false;

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBackgroundColor:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableBackgroundColor', '#f00', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableBackgroundColor:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableBackgroundColor', '#f00', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast tableBackgroundColor', () => {
					model.change( writer => writer.setAttribute( 'tableBackgroundColor', '#f00', table ) );

					assertTableStyle( editor, 'background-color:#f00;' );
				} );

				it( 'should downcast tableBackgroundColor removal', () => {
					model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

					model.change( writer => writer.removeAttribute( 'backgroundColor', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast tableBackgroundColor change', () => {
					model.change( writer => writer.setAttribute( 'tableBackgroundColor', '#f00', table ) );

					assertTableStyle( editor, 'background-color:#f00;' );

					model.change( writer => writer.setAttribute( 'tableBackgroundColor', '#ba7', table ) );

					assertTableStyle( editor, 'background-color:#ba7;' );
				} );
			} );
		} );

		describe( 'tableWidth', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableWidth' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast width from <table>', () => {
					editor.setData( '<table style="width:1337px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast width from <figure>', () => {
					editor.setData( '<figure class="table" style="width:1337px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast width from <figure> if both <figure> and <table> has width style set', () => {
					editor.setData(
						'<figure class="table" style="width:75%">' +
							'<table style="width:95%"><tbody><tr><td>foo</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '75%' );
				} );

				it( 'should not upcast width if <table> inside <figure> has width style set', () => {
					editor.setData(
						'<figure class="table">' +
							'<table style="width:95%"><tbody><tr><td>1</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.be.undefined;
				} );

				it( 'should upcast width attribute from <table>', () => {
					editor.setData( '<table width="1337"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast width from style not <table> attribute', () => {
					editor.setData( '<table width="1337" style="width: 654px;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '654px' );
				} );

				it( 'should upcast width from <figure> style and ignore table width attribute', () => {
					editor.setData(
						'<figure class="table" style="width: 543px">' +
							'<table width="234"><tbody><tr><td>1</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.equal( '543px' );
				} );

				it( 'should consume width style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									width: '50%'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'width' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="width:50%"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableWidth' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume width attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									width: '123px'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'width' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table width=123><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableWidth' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should not consume width style from other figure elements', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, ImageBlockEditing, ImageResizeEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									width: '50%'
								}
							}
						}
					} );
					const model = editor.model;

					editor.setData( '<figure class="image" style="width:50%"><img src="/assets/sample.png" alt="alt text"></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="alt text" resizedWidth="50%" src="/assets/sample.png"></imageBlock>'
					);

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableWidth:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableWidth', '400px', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableWidth:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableWidth', '400px', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast tableWidth', () => {
					model.change( writer => writer.setAttribute( 'tableWidth', '1337px', table ) );

					assertTableStyle( editor, null, 'width:1337px;' );
				} );

				it( 'should downcast tableWidth removal', () => {
					model.change( writer => writer.setAttribute( 'tableWidth', '1337px', table ) );

					model.change( writer => writer.removeAttribute( 'tableWidth', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast width change', () => {
					model.change( writer => writer.setAttribute( 'tableWidth', '1337px', table ) );

					assertTableStyle( editor, null, 'width:1337px;' );

					model.change( writer => writer.setAttribute( 'tableWidth', '1410em', table ) );

					assertTableStyle( editor, null, 'width:1410em;' );
				} );
			} );
		} );

		describe( 'tableHeight', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableHeight' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast height from <table>', () => {
					editor.setData( '<table style="height:1337px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast height from <figure>', () => {
					editor.setData( '<figure class="table" style="height:1337px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast height from <figure> if both <figure> and <table> has height style set', () => {
					editor.setData(
						'<figure class="table" style="height:75%">' +
							'<table style="height:95%"><tbody><tr><td>foo</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '75%' );
				} );

				it( 'should not upcast height if <table> inside <figure> has height style set', () => {
					editor.setData(
						'<figure class="table">' +
							'<table style="height:95%"><tbody><tr><td>1</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.be.undefined;
				} );

				it( 'should upcast height attribute from <table>', () => {
					editor.setData( '<table height="1337"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '1337px' );
				} );

				it( 'should upcast height from style not <table> attribute', () => {
					editor.setData( '<table height="1337" style="height: 654px;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '654px' );
				} );

				it( 'should upcast height from <figure> style and ignore table height attribute', () => {
					editor.setData(
						'<figure class="table" style="height: 543px">' +
							'<table height="234"><tbody><tr><td>1</td></tr></tbody></table>' +
						'</figure>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.equal( '543px' );
				} );

				it( 'should consume height style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									height: '123px'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'height' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="height:123px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableHeight' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume height attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									height: '123px'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'height' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table height=123><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableHeight' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should not consume height style from other figure elements', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, ImageBlockEditing, ImageResizeEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									height: '50%'
								}
							}
						}
					} );
					const model = editor.model;

					editor.setData( '<figure class="image" style="height:50%"><img src="/assets/sample.png" alt="alt text"></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="alt text" resizedHeight="50%" src="/assets/sample.png"></imageBlock>'
					);

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should downcast tableHeight', () => {
					model.change( writer => writer.setAttribute( 'tableHeight', '1337px', table ) );

					assertTableStyle( editor, null, 'height:1337px;' );
				} );

				it( 'should downcast tableHeight removal', () => {
					model.change( writer => writer.setAttribute( 'tableHeight', '1337px', table ) );

					model.change( writer => writer.removeAttribute( 'tableHeight', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast tableHeight change', () => {
					model.change( writer => writer.setAttribute( 'tableHeight', '1337px', table ) );

					assertTableStyle( editor, null, 'height:1337px;' );

					model.change( writer => writer.setAttribute( 'tableHeight', '1410em', table ) );

					assertTableStyle( editor, null, 'height:1410em;' );
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableHeight:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableHeight', '400px', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableHeight:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'high' } ) );

					model.change( writer => writer.setAttribute( 'tableHeight', '400px', table ) );

					assertTableStyle( editor, '' );
				} );
			} );
		} );

		describe( 'tableAlignment', () => {
			it( 'should set proper schema rules', () => {
				expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableAlignment' ) ).to.be.true;
			} );

			describe( 'upcast conversion', () => {
				it( 'should upcast style="float:right" to right value', () => {
					editor.setData( '<table style="float:right"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast style="float:left;" to left value', () => {
					editor.setData( '<table style="float:left;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'left' );
				} );

				it( 'should discard the unknown float value (style="float:foo;")', () => {
					editor.setData( '<table style="float:foo;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast align=right attribute', () => {
					editor.setData( '<table align="right"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast align=left attribute', () => {
					editor.setData( '<table align="left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'left' );
				} );

				it( 'should discard align=center attribute', () => {
					// But it should consume it as it is the default alignment, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table align="center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should consume default align style', () => {
					// But it should consume it as it is the default alignment, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: [ 'margin-left', 'margin-right' ] } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="margin-left: auto; margin-right: auto;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should discard align=justify attribute', () => {
					editor.setData( '<table align="justify"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableAlignment' ) ).to.be.false;
				} );

				it( 'should consume alignment style even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'float' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table style="float:left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableAlignment' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should consume align attribute even if it is default', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left'
								}
							}
						}
					} );
					const model = editor.model;

					// But it should consume it, so GHS won't store it.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'align' } ) ).to.be.false;
					}, { priority: 'lowest' } ) );

					editor.setData( '<table align="left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.hasAttribute( 'tableAlignment' ) ).to.be.false;

					await editor.destroy();
				} );

				it( 'should not consume alignmnent float style from other figure elements', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, ImageBlockEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'right'
								}
							}
						}
					} );
					const model = editor.model;

					// Make sure that float style is not consumed from other figure elements.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'float' } ) ).to.be.true;
					}, { priority: 'lowest' } ) );

					editor.setData( '<figure class="image" style="float:right"><img src="/assets/sample.png" alt="alt text"></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>'
					);

					await editor.destroy();
				} );

				it( 'should not consume alignment margins style from other figure elements', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, ImageBlockEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'center'
								}
							}
						}
					} );
					const model = editor.model;

					// Make sure that float style is not consumed from other figure elements.
					editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-left' } ) ).to.be.true;
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-right' } ) ).to.be.true;
					}, { priority: 'lowest' } ) );

					editor.setData(
						'<figure class="image" style="margin-left:auto;margin-right:auto;">' +
							'<img src="/assets/sample.png" alt="alt text">' +
						'</figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>'
					);

					await editor.destroy();
				} );
			} );

			describe( 'downcast conversion', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'should consume converted item', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableAlignment:table', ( evt, data, conversionApi ) => {
							expect( conversionApi.consumable.consume( data.item, evt.name ) ).to.be.false;
						} ) );

					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );
				} );

				it( 'should be overridable', () => {
					editor.conversion.for( 'downcast' )
						.add( dispatcher => dispatcher.on( 'attribute:tableAlignment:table', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						}, { priority: 'highest' } ) );

					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertTableStyle( editor, '' );
				} );

				it( 'should downcast "right" tableAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );
				} );

				it( 'should downcast "left" tableAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );
				} );

				it( 'should downcast "center" tableAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'center', table ) );

					assertTableStyle( editor, null, 'float:none;' );
				} );

				describe( 'with TableLayoutEditing', () => {
					let editor, model;

					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ TablePropertiesEditing, Paragraph, TableEditing, TableLayoutEditing ]
						} );

						model = editor.model;
					} );

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should downcast "center" alignment for content table using float:none', () => {
						setModelData( model,
							'<table headingRows="0" headingColumns="0">' +
								'<tableRow><tableCell><paragraph>content table</paragraph></tableCell></tableRow>' +
							'</table>'
						);

						const contentTable = model.document.getRoot().getNodeByPath( [ 0 ] );
						model.change( writer => writer.setAttribute( 'tableAlignment', 'center', contentTable ) );

						expect( editor.getData() ).to.be.equal(
							'<figure class="table content-table" style="float:none;">' +
								'<table>' +
									'<tbody>' +
										'<tr><td>content table</td></tr>' +
									'</tbody>' +
								'</table>' +
							'</figure>'
						);
					} );

					it( 'should downcast "center" alignment for layout table using auto margins', () => {
						setModelData( model,
							'<table tableType="layout" headingRows="0" headingColumns="0">' +
								'<tableRow><tableCell><paragraph>layout table</paragraph></tableCell></tableRow>' +
							'</table>'
						);

						const layoutTable = model.document.getRoot().getNodeByPath( [ 0 ] );
						model.change( writer => writer.setAttribute( 'tableAlignment', 'center', layoutTable ) );

						expect( editor.getData() ).to.be.equal(
							'<figure class="table layout-table" style="margin-left:auto;margin-right:auto;" role="presentation">' +
								'<table>' +
									'<tbody>' +
										'<tr><td>layout table</td></tr>' +
									'</tbody>' +
								'</table>' +
							'</figure>'
						);
					} );
				} );

				it( 'should downcast changed tableAlignment (left -> right)', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );

					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );
				} );

				it( 'should downcast changed tableAlignment (right -> left)', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );

					model.change( writer => writer.setAttribute( 'tableAlignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );
				} );

				it( 'should downcast removed tableAlignment (from left)', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'left', table ) );

					assertTableStyle( editor, null, 'float:left;' );

					model.change( writer => writer.removeAttribute( 'tableAlignment', table ) );

					assertTableStyle( editor );
				} );

				it( 'should downcast removed tableAlignment (from right)', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertTableStyle( editor, null, 'float:right;' );

					model.change( writer => writer.removeAttribute( 'tableAlignment', table ) );

					assertTableStyle( editor );
				} );
			} );
		} );

		// When default properties are specified, we do not want to put them into the model values if they are equal to the defaults.
		describe( 'default table properties', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left',
									borderStyle: 'dashed',
									borderColor: '#ff0',
									borderWidth: '2px',
									backgroundColor: '#00f',
									width: '250px',
									height: '150px'
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
				it( 'should not upcast the default `border` values', () => {
					editor.setData( '<table style="border:2px dashed #ff0"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderStyle' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-color` value', () => {
					editor.setData( '<table style="border-color:#ff0"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-style` value', () => {
					editor.setData( '<table style="border-style:dashed"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderStyle' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `border-width` value', () => {
					editor.setData( '<table style="border-width:2px"><tr><td>foo</td></tr></table>' );

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderWidth' ) ).to.be.undefined;
				} );
			} );

			describe( 'background color', () => {
				it( 'should not upcast the default `background-color` value', () => {
					editor.setData( '<table style="background-color:#00f"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `background` value', () => {
					editor.setData( '<table style="background:#00f"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.be.undefined;
				} );
			} );

			describe( 'width', () => {
				it( 'should not upcast the default `width` value from <table>', () => {
					editor.setData( '<table style="width:250px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `width` value from <figure>', () => {
					editor.setData( '<figure class="table" style="width:250px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.be.undefined;
				} );
			} );

			describe( 'height', () => {
				it( 'should not upcast the default `height` value from <table>', () => {
					editor.setData( '<table style="height:150px"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default `height` value from <figure>', () => {
					editor.setData( '<figure class="table" style="height:150px"><table><tr><td>foo</td></tr></table></figure>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.be.undefined;
				} );
			} );

			describe( 'alignment', () => {
				it( 'should not upcast the default value from the style attribute (float:left)', () => {
					editor.setData( '<table style="float:left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should not upcast the default value from the align attribute (left)', () => {
					editor.setData( '<table align="left"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast style="float:none" as "center" option', () => {
					editor.setData( '<table style="float:none;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'center' );
				} );

				it( 'should upcast style="margin-left:auto;margin-right:auto;" as "center" option', () => {
					editor.setData( '<table style="margin-left:auto;margin-right:auto;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'center' );
				} );

				it( 'should upcast align=center attribute', () => {
					editor.setData( '<table align="center"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'center' );
				} );

				it( 'should not upcast the default value (center) from style margin auto', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'center'
								}
							}
						}
					} );
					const model = editor.model;

					editor.setData( '<table style="margin-left:auto;margin-right:auto;"><tr><td>foo</td></tr></table>' );
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;

					await editor.destroy();
				} );
			} );
		} );

		describe( 'default layout tables properties', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, TableLayoutEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left',
									borderStyle: 'none',
									borderColor: '',
									borderWidth: '',
									backgroundColor: '#00f',
									width: '250px',
									height: '150px'
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
				it( 'should not upcast the default `border` values', () => {
					editor.setData(
						'<table class="layout-table" style="border-style: none">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderStyle' ) ).to.be.undefined;
					expect( table.getAttribute( 'tableBorderWidth' ) ).to.be.undefined;
				} );

				it( 'should upcast non-default `border-style` value', () => {
					editor.setData(
						'<table class="layout-table" style="border-style:dashed">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderStyle' ) ).to.be.equal( 'dashed' );
				} );

				it( 'should upcast non-default `border-color` value', () => {
					editor.setData(
						'<table class="layout-table" style="border-color:#ff0">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderColor' ) ).to.be.equal( '#ff0' );
				} );

				it( 'should upcast non-default `border-width` value', () => {
					editor.setData(
						'<table class="layout-table" style="border-width:2px">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);

					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBorderWidth' ) ).to.be.equal( '2px' );
				} );
			} );

			describe( 'background color', () => {
				it( 'should upcast non-default `background-color` value', () => {
					editor.setData(
						'<table class="layout-table" style="background-color:#00f">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.be.equal( '#00f' );
				} );

				it( 'should upcast non-default `background` value', () => {
					editor.setData(
						'<table class="layout-table" style="background:#00f">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableBackgroundColor' ) ).to.be.equal( '#00f' );
				} );
			} );

			describe( 'width', () => {
				it( 'should upcast non-default `width` value from <table>', () => {
					editor.setData(
						'<table class="layout-table" style="width:250px">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableWidth' ) ).to.be.equal( '250px' );
				} );
			} );

			describe( 'height', () => {
				it( 'should upcast non-default `height` value from <table>', () => {
					editor.setData(
						'<table class="layout-table" style="height:150px">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableHeight' ) ).to.be.equal( '150px' );
				} );
			} );

			describe( 'alignment', () => {
				it( 'should not upcast the default value from the align attribute (none)', () => {
					editor.setData(
						'<table class="layout-table" align="none">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.undefined;
				} );

				it( 'should upcast the non-default value from the style attribute (float:left)', () => {
					editor.setData(
						'<table class="layout-table" style="float:left">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.equal( 'left' );
				} );

				it( 'should upcast the non-default value from the style attribute (float:right)', () => {
					editor.setData(
						'<table class="layout-table" style="float:right">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.equal( 'right' );
				} );

				it( 'should upcast the non-default value from the style attribute (margin-left:auto;margin-right:auto)', () => {
					editor.setData(
						'<table class="layout-table" style="margin-left:auto;margin-right:auto">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.be.equal( 'center' );
				} );

				it( 'should upcast align=left attribute', () => {
					editor.setData(
						'<table class="layout-table" align="left">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'left' );
				} );

				it( 'should upcast align=right attribute', () => {
					editor.setData(
						'<table class="layout-table" align="right">' +
							'<tr>' +
								'<td>foo</td>' +
							'</tr>' +
						'</table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'right' );
				} );

				it( 'should upcast the table default value from the style attribute (margin-left:auto;margin-right:auto)', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ TablePropertiesEditing, Paragraph, TableEditing, TableLayoutEditing ],
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'center'
								}
							}
						}
					} );
					const model = editor.model;

					editor.setData(
						'<table class="layout-table" style="margin-left:auto;margin-right:auto;"><tr><td>foo</td></tr></table>'
					);
					const table = model.document.getRoot().getNodeByPath( [ 0 ] );

					expect( table.getAttribute( 'tableAlignment' ) ).to.equal( 'center' );

					await editor.destroy();
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
