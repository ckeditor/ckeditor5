/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from 'ckeditor5';
import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';
import { MiniInspectorEditor } from '@snippets/mini-inspector.js';

function Image( editor ) {
	editor.model.schema.register( 'image', {
		inheritAllFrom: '$block',
		allowAttributes: [ 'source' ]
	} );

	editor.conversion.elementToElement( {
		view: 'img',
		model: 'image'
	} );

	editor.conversion.attributeToAttribute( {
		view: {
			name: 'img',
			key: 'src'
		},
		model: 'source'
	} );
}

MiniInspectorEditor.create( document.querySelector( '#mini-inspector-upcast-attribute' ), {
	plugins: [ Essentials, Image ],
	toolbar: []
} )
	.then( editor => {
		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-upcast-attribute-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
