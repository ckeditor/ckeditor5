/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TableEditing from '../../src/tableediting';
import TableStyleEditing from '../../src/tablestyleediting';

describe.only( 'Table styles conversion', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableStyleEditing, Paragraph, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				// Since this part of test tests only view->model conversion editing pipeline is not necessary
				// so defining model->view converters won't be necessary.
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
} );
