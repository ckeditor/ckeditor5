/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '../../src/typing.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph ],
		toolbar: []
	} )
	.then( editor => {
		window.editor = editor;

		editor.model.schema.extend( '$text', { allowIn: '$root' } );

		const editable = editor.ui.getEditableElement();

		document.querySelector( '#nbsp' ).addEventListener( 'click', () => {
			editor.model.change( writer => {
				writer.setSelection( editor.model.document.selection.getFirstRange().start );
				writer.insertText( '\u00A0', editor.model.document.selection.getFirstPosition() );
			} );
		} );

		editor.model.document.on( 'change', () => {
			console.clear();

			const modelData = _getModelData( editor.model, { withoutSelection: true } );
			console.log( 'model:', modelData.replace( /\u00A0/g, '&nbsp;' ) );

			const viewData = _getViewData( editor.editing.view, { withoutSelection: true } );
			console.log( 'view:', viewData.replace( /\u00A0/g, '&nbsp;' ) );

			console.log( 'dom:', editable.innerHTML );
			console.log( 'editor.getData', editor.getData() );
		}, { priority: 'lowest' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
