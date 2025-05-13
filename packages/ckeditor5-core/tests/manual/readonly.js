/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import ArticlePluginSet from '../_utils/articlepluginset.js';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, BalloonToolbar ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const button1 = document.querySelector( '#read-only-1' );
		const button2 = document.querySelector( '#read-only-2' );

		enableReadOnlyManagement( button1, editor, 'feature-1' );
		enableReadOnlyManagement( button2, editor, 'feature-2' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function enableReadOnlyManagement( button, editor, lockName ) {
	let isReadOnly = false;

	button.addEventListener( 'click', () => {
		isReadOnly = !isReadOnly;

		if ( isReadOnly ) {
			editor.enableReadOnlyMode( lockName );
		} else {
			editor.disableReadOnlyMode( lockName );
		}

		button.textContent = isReadOnly ?
			`${ lockName }: Clear the read-only mode lock` :
			`${ lockName }: Create read-only mode lock`;

		editor.editing.view.focus();
	} );

	button.textContent = `${ lockName }: Create read-only mode lock`;
}
