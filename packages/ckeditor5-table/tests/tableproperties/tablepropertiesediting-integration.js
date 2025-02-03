/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../src/tableediting.js';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting.js';

import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting.js';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';

import { assertTableStyle } from '../_utils/utils.js';

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
				model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

				assertTableStyle( editor, null, 'float:right;' );
			} );

			it( 'Alignment command should be disabled when table is selected', () => {
				model.change( writer => {
					writer.setSelection( table, 'on' );
				} );

				expect( editor.commands.get( 'alignment' ).isEnabled ).to.be.false;
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

				expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( 'red' );
				expect( firstCell.getAttribute( 'tableCellBackgroundColor' ) ).to.equal( 'green' );

				editor.execute( 'undo' );

				expect( table.getAttribute( 'tableBackgroundColor' ) ).to.equal( 'red' );
				expect( firstCell.getAttribute( 'tableCellBackgroundColor' ) ).to.be.undefined;

				editor.execute( 'undo' );

				expect( table.getAttribute( 'tableBackgroundColor' ) ).to.be.undefined;
				expect( firstCell.getAttribute( 'tableCellBackgroundColor' ) ).to.be.undefined;
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
