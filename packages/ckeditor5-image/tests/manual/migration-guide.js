/* global console, window, document */

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/src/ckeditor';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

DecoupledEditor.create( document.querySelector( '#editor-document' ) ).then( editor => {
	document.querySelector( '#editor-document-toolbar' ).appendChild( editor.ui.view.toolbar.element );
	document.querySelector( '#editor-document-editing' ).appendChild( editor.ui.view.editable.element );
} ).catch( error => {
	console.error( 'There was a problem initializing the document editor.', error );
} );

ClassicEditor.create( document.querySelector( '#editor-article' ) ).catch( error => {
	console.error( 'There was a problem initializing the classic editor.', error );
} );
