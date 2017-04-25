/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';
import ContextualToolbar from '../../../../src/toolbar/contextual/contextualtoolbar';

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

// Editor for the ContextualToolbar plugin.
ClassicEditor.create( document.querySelector( '#editor-ct' ), {
	plugins: [ ArticlePresets, ContextualToolbar ],
	toolbar: [ 'undo', 'redo' ],
	contextualToolbar: [ 'bold', 'italic' ]
} )
.then( editor => {
	initExternalChangesHandler( editor, document.querySelector( '#button-ct' ) );
} )
.catch( err => console.error( err.stack ) );

// Editor for the Link plugin.
ClassicEditor.create( document.querySelector( '#editor-link' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'undo', 'redo', 'link' ],
	contextualToolbar: [ 'bold', 'italic' ]
} )
.then( editor => {
	initExternalChangesHandler( editor, document.querySelector( '#button-link' ) );
} )
.catch( err => console.error( err.stack ) );

// Editor for the Link plugin.
ClassicEditor.create( document.querySelector( '#editor-image-toolbar' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'undo', 'redo' ],
	image: {
		toolbar: [ 'imageStyleFull', 'imageStyleSide', '|' , 'imageTextAlternative' ]
	}
} )
.then( editor => {
	initExternalChangesHandler( editor, document.querySelector( '#button-image-toolbar' ) );
} )
.catch( err => console.error( err.stack ) );

export function initExternalChangesHandler( editor, element, deleteData ) {
	element.addEventListener( 'click', () => {
		element.disabled = true;
		startExternalDelete( editor, deleteData );
	} );
}

function startExternalDelete( editor, deleteData = [ [ 1 ], 1 ] ) {
	const document = editor.document;
	const bath = document.batch( 'transparent' );

	setTimeout( () => {
		document.enqueueChanges( () => {
			bath.remove( Range.createFromPositionAndShift( new Position( document.getRoot(), deleteData[ 0 ] ), deleteData[ 1 ] ) );
		} );
	}, 3000 );
}
