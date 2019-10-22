/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TableEditing from '../../src/tableediting';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import TableColumnRowProperties from '../../src/tablecolumnrowproperites';

describe( 'Table styles conversion', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableColumnRowProperties, Paragraph, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				// Since this part of test tests only data conversion so editing pipeline is not necessary.
				editor.editing.destroy();
			} );
	} );

	describe( 'upcast', () => {
		it( 'should upcast height attribute', () => {
			editor.setData( '<table><tr style="height:20px"><td>foo</td></tr></table>' );
			const tableRow = model.document.getRoot().getNodeByPath( [ 0, 0 ] );

			expect( tableRow.getAttribute( 'height' ) ).to.equal( '20px' );
		} );
	} );

	describe( 'downcast', () => {
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
