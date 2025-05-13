/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar.js';

// Plugin that watches for addRoot and detachRoot events and creates or removes editable elements.
class MultiRootWatchEditables {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const { editor } = this;

		editor.on( 'addRoot', ( evt, root ) => {
			const domElement = this.editor.createEditable( root );

			document.getElementById( 'editables' ).appendChild( domElement );
		} );

		editor.on( 'detachRoot', ( evt, root ) => {
			this.editor.detachEditable( root ).remove();
		} );
	}
}

// Build the editor
MultiRootEditor.create(
	{
		header: document.getElementById( 'header' ),
		content: document.getElementById( 'content' )
	},
	{
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, BalloonToolbar, MultiRootWatchEditables ],
		toolbar: [ 'bold', 'italic', 'link', 'undo', 'redo' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	}
)
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Handle adding and removing roots.
document.getElementById( 'add-root' ).addEventListener( 'click', () => {
	const id = Date.now();

	window.editor.addRoot( `root-${ id }`, {
		data: `<p>Added root - ${ new Date().toISOString() }</p>`
	} );
} );

document.getElementById( 'remove-root' ).addEventListener( 'click', () => {
	const rootNames = window.editor.model.document.getRootNames();

	window.editor.detachRoot( rootNames[ rootNames.length - 1 ] );
} );
