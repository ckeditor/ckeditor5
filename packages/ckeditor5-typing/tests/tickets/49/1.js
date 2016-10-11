/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import { getData as getModelData } from '/ckeditor5/engine/dev-utils/model.js';
import { getData as getViewData } from '/ckeditor5/engine/dev-utils/view.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ 'enter', 'typing', 'paragraph' ],
	toolbar: []
} )
.then( editor => {
	window.editor = editor;

	editor.document.schema.allow( { name: '$text', inside: '$root' } );

	const editable = editor.ui.editableElement;

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
