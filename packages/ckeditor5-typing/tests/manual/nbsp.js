/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '../../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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

			const modelData = getModelData( editor.model, { withoutSelection: true } );
			console.log( 'model:', modelData.replace( /\u00A0/g, '&nbsp;' ) );

			const viewData = getViewData( editor.editing.view, { withoutSelection: true } );
			console.log( 'view:', viewData.replace( /\u00A0/g, '&nbsp;' ) );

			console.log( 'dom:', editable.innerHTML );
			console.log( 'editor.getData', editor.getData() );
		}, { priority: 'lowest' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
