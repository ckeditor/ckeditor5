/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';

// This file will be available when the documentation is built.
import { MiniInspectorEditor } from '../mini-inspector.js';

function CustomHeading( editor ) {
	editor.model.schema.register( 'heading', {
		allowAttributes: [ 'level' ],
		inheritAllFrom: '$block'
	} );

	editor.conversion.elementToElement( {
		model: 'heading',
		view: 'h1'
	} );
}

MiniInspectorEditor.create( document.querySelector( '#mini-inspector-heading' ), {
	plugins: [ Essentials, CustomHeading ],
	toolbar: []
} )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-heading-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
