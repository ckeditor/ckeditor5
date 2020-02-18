/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable } from './_utils/utils';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

describe( 'table selection', () => {
	let editor, model, modelRoot, tableSelection, viewDocument;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableEditing, TableSelection, Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '11[]', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'Clipboard integration', () => {
		describe( 'cut', () => {
			it( 'is disabled for multi-range selection over a table', () => {
				const dataTransferMock = createDataTransfer();
				const preventDefaultSpy = sinon.spy();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
				tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: preventDefaultSpy
				} );

				sinon.assert.notCalled( spy );
				sinon.assert.calledOnce( preventDefaultSpy );
			} );

			it( 'is not disabled normal selection over a table', () => {
				const dataTransferMock = createDataTransfer();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	function createDataTransfer() {
		const store = new Map();

		return {
			setData( type, data ) {
				store.set( type, data );
			},

			getData( type ) {
				return store.get( type );
			}
		};
	}
} );
