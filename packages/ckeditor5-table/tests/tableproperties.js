/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import TableEditing from '../src/tableediting';
import TableProperties from '../src/tableproperites';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'TableProperties', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableProperties, Paragraph, TableEditing ]
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
		expect( TableProperties.pluginName ).to.equal( 'TableProperties' );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderColor' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderStyle' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'borderWidth' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'backgroundColor' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'width' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'height' ) ).to.be.true;
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
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
					'<table style="border-right-width:1px;border-right-style:solid;border-right-color:#f00"><tr><td>foo</td></tr></table>'
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

			it( 'should upcast background-color', () => {
				editor.setData( '<table style="background-color:#f00"><tr><td>foo</td></tr></table>' );
				const table = model.document.getRoot().getNodeByPath( [ 0 ] );

				expect( table.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
			} );
		} );

		describe( 'downcast', () => {
			let table;

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
				table = model.document.getRoot().getNodeByPath( [ 0 ] );
			} );

			it( 'should downcast borderColor attribute (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderColor', {
					top: '#f00',
					right: '#f00',
					bottom: '#f00',
					left: '#f00'
				}, table ) );

				assertTableStyle( 'border-top:#f00;border-right:#f00;border-bottom:#f00;border-left:#f00;' );
			} );

			it( 'should downcast borderColor attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderColor', {
					top: '#f00',
					right: 'hsla(0, 100%, 50%, 0.5)',
					bottom: 'deeppink',
					left: 'rgb(255, 0, 0)'
				}, table ) );

				assertTableStyle(
					'border-top:#f00;' +
					'border-right:hsla(0, 100%, 50%, 0.5);' +
					'border-bottom:deeppink;' +
					'border-left:rgb(255, 0, 0);'
				);
			} );

			it( 'should downcast borderStyle attribute (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderStyle', {
					top: 'solid',
					right: 'solid',
					bottom: 'solid',
					left: 'solid'
				}, table ) );

				assertTableStyle( 'border-top:solid;border-right:solid;border-bottom:solid;border-left:solid;' );
			} );

			it( 'should downcast borderStyle attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderStyle', {
					top: 'solid',
					right: 'ridge',
					bottom: 'dotted',
					left: 'dashed'
				}, table ) );

				assertTableStyle( 'border-top:solid;border-right:ridge;border-bottom:dotted;border-left:dashed;' );
			} );

			it( 'should downcast borderWidth attribute (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderWidth', {
					top: '42px',
					right: '.1em',
					bottom: '1337rem',
					left: 'thick'
				}, table ) );

				assertTableStyle( 'border-top:42px;border-right:.1em;border-bottom:1337rem;border-left:thick;' );
			} );

			it( 'should downcast borderWidth attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderWidth', {
					top: '42px',
					right: '42px',
					bottom: '42px',
					left: '42px'
				}, table ) );

				assertTableStyle( 'border-top:42px;border-right:42px;border-bottom:42px;border-left:42px;' );
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

				assertTableStyle(
					'border-top:42px solid #f00;' +
					'border-right:42px solid #f00;' +
					'border-bottom:42px solid #f00;' +
					'border-left:42px solid #f00;'
				);
			} );

			it( 'should downcast borderColor, borderStyle and borderWidth attributes together (different top, right, bottom, left)', () => {
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

				assertTableStyle(
					'border-top:42px solid #f00;' +
					'border-right:.1em ridge hsla(0, 100%, 50%, 0.5);' +
					'border-bottom:1337rem dotted deeppink;' +
					'border-left:thick dashed rgb(255, 0, 0);'
				);
			} );

			it( 'should downcast backgroundColor', () => {
				model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', table ) );

				assertTableStyle( 'background-color:#f00;' );
			} );

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

					assertTableStyle(
						'border-top:42px solid deeppink;' +
						'border-right:42px solid deeppink;' +
						'border-bottom:42px solid deeppink;' +
						'border-left:42px solid deeppink;'
					);
				} );

				it( 'should downcast borderStyle attribute change', () => {
					model.change( writer => writer.setAttribute( 'borderStyle', {
						top: 'ridge',
						right: 'ridge',
						bottom: 'ridge',
						left: 'ridge'
					}, table ) );

					assertTableStyle(
						'border-top:42px ridge #f00;' +
						'border-right:42px ridge #f00;' +
						'border-bottom:42px ridge #f00;' +
						'border-left:42px ridge #f00;'
					);
				} );

				it( 'should downcast borderWidth attribute change', () => {
					model.change( writer => writer.setAttribute( 'borderWidth', {
						top: 'thick',
						right: 'thick',
						bottom: 'thick',
						left: 'thick'
					}, table ) );

					assertTableStyle(
						'border-top:thick solid #f00;' +
						'border-right:thick solid #f00;' +
						'border-bottom:thick solid #f00;' +
						'border-left:thick solid #f00;'
					);
				} );

				it( 'should downcast borderColor attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderColor', table ) );

					assertTableStyle(
						'border-top:42px solid;' +
						'border-right:42px solid;' +
						'border-bottom:42px solid;' +
						'border-left:42px solid;'
					);
				} );

				it( 'should downcast borderStyle attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderStyle', table ) );

					assertTableStyle(
						'border-top:42px #f00;' +
						'border-right:42px #f00;' +
						'border-bottom:42px #f00;' +
						'border-left:42px #f00;'
					);
				} );

				it( 'should downcast borderWidth attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderWidth', table ) );

					assertTableStyle(
						'border-top:solid #f00;' +
						'border-right:solid #f00;' +
						'border-bottom:solid #f00;' +
						'border-left:solid #f00;'
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

		/**
		 * Assertion helper for top-right-bottom-left attribute object.
		 *
		 * @param {module:engine/model/node~Node} tableCell
		 * @param {String} key Attribute key
		 * @param {String} top Top value. Pass null to omit value in attributes object.
		 * @param {String} [right=top] Right value - defaults to top if not provided.
		 * Pass null to omit value in attributes object.
		 * @param {String} [bottom=top] Bottom value - defaults to top (right value must be defined).
		 * Pass null to omit value in attributes object.
		 * @param {String} [left=right] Left value - defaults to right (bottom and right values must be defined).
		 * Pass null to omit value in attributes object.
		 */
		function assertTRBLAttribute( tableCell, key, top, right = top, bottom = top, left = right ) {
			const styleObject = {};

			if ( top ) {
				styleObject.top = top;
			}

			if ( right ) {
				styleObject.right = right;
			}

			if ( bottom ) {
				styleObject.bottom = bottom;
			}

			if ( left ) {
				styleObject.left = left;
			}

			expect( tableCell.getAttribute( key ) ).to.deep.equal( styleObject );
		}

		/**
		 * Assertion helper for testing <table> style attribute.
		 *
		 * @param {String} tableStyle A style to assert on table.
		 */
		function assertTableStyle( tableStyle ) {
			assertEqualMarkup( editor.getData(),
				`<figure class="table"><table style="${ tableStyle }"><tbody><tr><td>foo</td></tr></tbody></table></figure>`
			);
		}
	} );
} );
