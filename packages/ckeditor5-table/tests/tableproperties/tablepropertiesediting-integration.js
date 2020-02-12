/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
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
