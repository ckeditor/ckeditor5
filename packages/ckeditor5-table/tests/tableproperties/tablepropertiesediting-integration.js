/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting';

import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

import { assertTableStyle } from '../_utils/utils';

describe( 'table properties', () => {
	describe( 'TablePropertiesEditing integration', () => {
		let editor, model;

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'Alignment', () => {
			let table;

			beforeEach( async () => {
				editor = await createEditorWithAdditionalPlugins( [ AlignmentEditing ] );

				model = editor.model;

				table = createEmptyTable();
			} );

			it( 'should properly downcast table with Alignment plugin enabled', () => {
				model.change( writer => writer.setAttribute( 'alignment', 'right', table ) );

				assertTableStyle( editor, null, 'float:right;' );
			} );
		} );

		describe( 'Undo', () => {
			let table;

			beforeEach( async () => {
				editor = await createEditorWithAdditionalPlugins( [ UndoEditing, TableCellPropertiesEditing ] );

				model = editor.model;

				table = createEmptyTable();
			} );

			// See https://github.com/ckeditor/ckeditor5/issues/6265.
			it( 'should correctly undo setting table and then cell style', () => {
				const firstCell = table.getChild( 0 ).getChild( 0 );

				editor.model.change( writer => {
					writer.setSelection( firstCell, 0 );
				} );

				editor.execute( 'tableBackgroundColor', { value: 'red' } );

				editor.execute( 'tableCellBackgroundColor', { value: 'green' } );

				expect( table.getAttribute( 'backgroundColor' ) ).to.equal( 'red' );
				expect( firstCell.getAttribute( 'backgroundColor' ) ).to.equal( 'green' );

				editor.execute( 'undo' );

				expect( table.getAttribute( 'backgroundColor' ) ).to.equal( 'red' );
				expect( firstCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;

				editor.execute( 'undo' );

				expect( table.getAttribute( 'backgroundColor' ) ).to.be.undefined;
				expect( firstCell.getAttribute( 'backgroundColor' ) ).to.be.undefined;
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

	function createEditorWithAdditionalPlugins( plugins ) {
		return VirtualTestEditor.create( {
			plugins: [ ...plugins, TablePropertiesEditing, Paragraph, TableEditing ]
		} );
	}
} );
