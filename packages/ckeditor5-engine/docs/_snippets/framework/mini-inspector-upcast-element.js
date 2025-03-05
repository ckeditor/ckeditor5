/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, document */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';

// This file will be available when the documentation is built.
import { MiniInspectorEditor } from '../mini-inspector.js';

function Example( editor ) {
	editor.model.schema.register( 'example', {
		inheritAllFrom: '$block'
	} );

	editor.conversion.elementToElement( {
		view: {
			name: 'div',
			classes: [ 'example' ]
		},
		model: 'example'
	} );
}

MiniInspectorEditor.create( document.querySelector( '#mini-inspector-upcast-element' ), {
	plugins: [ Essentials, Example ],
	toolbar: []
} )
	.then( editor => {
		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-upcast-element-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
