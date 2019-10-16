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
		} );
	} );

	/**
	 * Assertion helper for top-right-bottom-left attribute object.
	 *
	 * @param {module:engine/model/node~Node} tableCell
	 * @param {String} key Attribute key
	 * @param {String} top Top value
	 * @param {String} [right=top] Right value - defaults to top if not provided.
	 * @param {String} [bottom=top] Bottom value - defaults to top (right value must be defined).
	 * @param {String} [left=right] Left value - defaults to right (bottom and right values must be defined).
	 */
	function assertTRBLAttribute( tableCell, key, top, right = top, bottom = top, left = right ) {
		expect( tableCell.getAttribute( key ) ).to.deep.equal( { top, right, bottom, left } );
	}
} );
