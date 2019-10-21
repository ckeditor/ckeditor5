/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TableEditing from '../../src/tableediting';
import TableStyleEditing from '../../src/tablestyleediting';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'Table styles conversion', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableStyleEditing, Paragraph, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				// Since this part of test tests only data conversion so editing pipeline is not necessary.
				editor.editing.destroy();
			} );
	} );

	describe( 'upcast', () => {
		describe( 'table cell', () => {
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
					'<table><tr><td style="border-right-width:1px;border-right-style:solid;border-right-color:#f00">foo</td></tr></table>'
				);

				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				assertTRBLAttribute( tableCell, 'borderColor', null, '#f00', null, null );
				assertTRBLAttribute( tableCell, 'borderStyle', null, 'solid', null, null );
				assertTRBLAttribute( tableCell, 'borderWidth', null, '1px', null, null );
			} );

			it( 'should upcast border-bottom-* styles', () => {
				editor.setData(
					'<table><tr>' +
					'<td style="border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#f00">foo</td>' +
					'</tr></table>'
				);

				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				assertTRBLAttribute( tableCell, 'borderColor', null, null, '#f00', null );
				assertTRBLAttribute( tableCell, 'borderStyle', null, null, 'solid', null );
				assertTRBLAttribute( tableCell, 'borderWidth', null, null, '1px', null );
			} );

			it( 'should upcast border-left-* styles', () => {
				editor.setData(
					'<table><tr><td style="border-left-width:1px;border-left-style:solid;border-left-color:#f00">foo</td></tr></table>'
				);

				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				assertTRBLAttribute( tableCell, 'borderColor', null, null, null, '#f00' );
				assertTRBLAttribute( tableCell, 'borderStyle', null, null, null, 'solid' );
				assertTRBLAttribute( tableCell, 'borderWidth', null, null, null, '1px' );
			} );

			it( 'should upcast background-color', () => {
				editor.setData( '<table><tr><td style="background-color:#f00">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				expect( tableCell.getAttribute( 'backgroundColor' ) ).to.equal( '#f00' );
			} );

			it( 'should upcast padding shorthand', () => {
				editor.setData( '<table><tr><td style="padding:2px 4em">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				assertTRBLAttribute( tableCell, 'padding', '2px', '4em' );
			} );

			it( 'should upcast vertical-align', () => {
				editor.setData( '<table><tr><td style="vertical-align:top">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				expect( tableCell.getAttribute( 'verticalAlignment' ) ).to.equal( 'top' );
			} );
		} );

		describe( 'table row', () => {
			it( 'should upcast height attribute', () => {
				editor.setData( '<table><tr style="height:20px"><td>foo</td></tr></table>' );
				const tableRow = model.document.getRoot().getNodeByPath( [ 0, 0 ] );

				expect( tableRow.getAttribute( 'height' ) ).to.equal( '20px' );
			} );
		} );
	} );

	describe( 'downcast', () => {
		describe( 'table cell', () => {
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

			it( 'should downcast borderColor attribute (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderColor', {
					top: '#f00',
					right: '#f00',
					bottom: '#f00',
					left: '#f00'
				}, tableCell ) );

				assertTableCellStyle( 'border-top:#f00;border-right:#f00;border-bottom:#f00;border-left:#f00;' );
			} );

			it( 'should downcast borderColor attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderColor', {
					top: '#f00',
					right: 'hsla(0, 100%, 50%, 0.5)',
					bottom: 'deeppink',
					left: 'rgb(255, 0, 0)'
				}, tableCell ) );

				assertTableCellStyle(
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
				}, tableCell ) );

				assertTableCellStyle( 'border-top:solid;border-right:solid;border-bottom:solid;border-left:solid;' );
			} );

			it( 'should downcast borderStyle attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderStyle', {
					top: 'solid',
					right: 'ridge',
					bottom: 'dotted',
					left: 'dashed'
				}, tableCell ) );

				assertTableCellStyle( 'border-top:solid;border-right:ridge;border-bottom:dotted;border-left:dashed;' );
			} );

			it( 'should downcast borderWidth attribute (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderWidth', {
					top: '42px',
					right: '.1em',
					bottom: '1337rem',
					left: 'thick'
				}, tableCell ) );

				assertTableCellStyle( 'border-top:42px;border-right:.1em;border-bottom:1337rem;border-left:thick;' );
			} );

			it( 'should downcast borderWidth attribute (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'borderWidth', {
					top: '42px',
					right: '42px',
					bottom: '42px',
					left: '42px'
				}, tableCell ) );

				assertTableCellStyle( 'border-top:42px;border-right:42px;border-bottom:42px;border-left:42px;' );
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

				assertTableCellStyle(
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

				assertTableCellStyle(
					'border-top:42px solid #f00;' +
					'border-right:.1em ridge hsla(0, 100%, 50%, 0.5);' +
					'border-bottom:1337rem dotted deeppink;' +
					'border-left:thick dashed rgb(255, 0, 0);'
				);
			} );

			it( 'should downcast backgroundColor', () => {
				model.change( writer => writer.setAttribute( 'backgroundColor', '#f00', tableCell ) );

				assertTableCellStyle( 'background-color:#f00;' );
			} );

			it( 'should downcast padding (same top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'padding', {
					top: '2px',
					right: '2px',
					bottom: '2px',
					left: '2px'
				}, tableCell ) );

				assertTableCellStyle( 'padding:2px;' );
			} );

			it( 'should downcast padding (different top, right, bottom, left)', () => {
				model.change( writer => writer.setAttribute( 'padding', {
					top: '2px',
					right: '3px',
					bottom: '4px',
					left: '5px'
				}, tableCell ) );

				assertTableCellStyle( 'padding:2px 3px 4px 5px;' );
			} );

			it( 'should downcast verticalAlignment', () => {
				model.change( writer => writer.setAttribute( 'verticalAlignment', 'middle', tableCell ) );

				assertTableCellStyle( 'vertical-align:middle;' );
			} );

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

					assertTableCellStyle(
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
					}, tableCell ) );

					assertTableCellStyle(
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
					}, tableCell ) );

					assertTableCellStyle(
						'border-top:thick solid #f00;' +
						'border-right:thick solid #f00;' +
						'border-bottom:thick solid #f00;' +
						'border-left:thick solid #f00;'
					);
				} );

				it( 'should downcast borderColor attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderColor', tableCell ) );

					assertTableCellStyle(
						'border-top:42px solid;' +
						'border-right:42px solid;' +
						'border-bottom:42px solid;' +
						'border-left:42px solid;'
					);
				} );

				it( 'should downcast borderStyle attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderStyle', tableCell ) );

					assertTableCellStyle(
						'border-top:42px #f00;' +
						'border-right:42px #f00;' +
						'border-bottom:42px #f00;' +
						'border-left:42px #f00;'
					);
				} );

				it( 'should downcast borderWidth attribute removal', () => {
					model.change( writer => writer.removeAttribute( 'borderWidth', tableCell ) );

					assertTableCellStyle(
						'border-top:solid #f00;' +
						'border-right:solid #f00;' +
						'border-bottom:solid #f00;' +
						'border-left:solid #f00;'
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

		describe( 'table row', () => {
			let tableRow;

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

				tableRow = model.document.getRoot().getNodeByPath( [ 0, 0 ] );
			} );

			it( 'should downcast height attribute', () => {
				model.change( writer => writer.setAttribute( 'height', '20px', tableRow ) );

				assertEqualMarkup(
					editor.getData(),
					'<figure class="table"><table><tbody><tr style="height:20px;"><td>foo</td></tr></tbody></table></figure>'
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
	 * Assertion helper for testing <td> style attribute.
	 *
	 * @param {String} tableCellStyle A style to assert on td.
	 */
	function assertTableCellStyle( tableCellStyle ) {
		assertEqualMarkup( editor.getData(),
			`<figure class="table"><table><tbody><tr><td style="${ tableCellStyle }">foo</td></tr></tbody></table></figure>`
		);
	}
} );
