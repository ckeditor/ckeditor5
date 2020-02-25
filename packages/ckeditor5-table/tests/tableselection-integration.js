/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable } from './_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'table selection', () => {
	let editor, model, tableSelection, modelRoot, element;

	describe( 'TableSelection - input integration', () => {
		afterEach( async () => {
			element.remove();
			await editor.destroy();
		} );

		describe( 'on delete', () => {
			beforeEach( async () => {
				await setupEditor( [ Delete ] );
			} );

			it( 'should clear contents of the selected table cells', () => {
				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );

				const domEventData = new DomEventData( editor.editing.view.document, {
					preventDefault: sinon.spy()
				}, {
					direction: 'backward',
					unit: 'character',
					sequence: 1
				} );
				editor.editing.view.document.fire( 'delete', domEventData );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ { contents: '', isSelected: true }, { contents: '', isSelected: true }, '13' ],
					[ { contents: '', isSelected: true }, { contents: '', isSelected: true }, '23' ],
					[ '31', '32', '33' ]
				] ) );
			} );

			it( 'should not interfere with default key handler if no table selection', () => {
				const domEventData = new DomEventData( editor.editing.view.document, {
					preventDefault: sinon.spy()
				}, {
					direction: 'backward',
					unit: 'character',
					sequence: 1
				} );
				editor.editing.view.document.fire( 'delete', domEventData );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '1[]', '12', '13' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				] ) );
			} );
		} );
	} );

	async function setupEditor( plugins ) {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ TableEditing, TableSelection, Paragraph, ...plugins ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	}
} );
