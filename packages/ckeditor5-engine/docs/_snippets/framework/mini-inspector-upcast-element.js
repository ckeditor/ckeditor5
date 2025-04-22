/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from 'ckeditor5';
import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';
import { MiniInspectorEditor } from '@snippets/mini-inspector.js';

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
