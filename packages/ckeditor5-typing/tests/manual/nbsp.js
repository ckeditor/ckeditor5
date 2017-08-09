/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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

		editor.document.schema.allow( { name: '$text', inside: '$root' } );

		const editable = editor.ui.view.editableElement;

		document.querySelector( '#nbsp' ).addEventListener( 'click', () => {
			editor.document.enqueueChanges( () => {
				editor.document.selection.collapseToStart();
				editor.document.batch().weakInsert( editor.document.selection.getFirstPosition(), '\u00A0' );
			} );
		} );

		editor.document.on( 'changesDone', () => {
			console.clear();

			const modelData = getModelData( editor.document, { withoutSelection: true } );
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
