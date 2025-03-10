/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from 'ckeditor5';
import MiniCKEditorInspector from '@ckeditor/ckeditor5-inspector/build/miniinspector.js';
import { MiniInspectorEditor } from '@snippets/mini-inspector.js';

function CustomHeading( editor ) {
	editor.model.schema.register( 'heading', {
		allowAttributes: [ 'level' ],
		inheritAllFrom: '$block'
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'h1',
		model: ( viewElement, { writer } ) => {
			return writer.createElement( 'heading', { level: '1' } );
		}
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: {
			name: 'heading',
			attributes: [ 'level' ]
		},
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement(
				'h' + modelElement.getAttribute( 'level' )
			);
		}
	} );

	const dropdown = document.getElementById(
		'mini-inspector-heading-interactive-dropdown'
	);

	dropdown.addEventListener( 'change', event => {
		editor.model.change( writer => {
			writer.setAttribute(
				'level',
				event.target.value,
				editor.model.document.getRoot().getChild( 0 )
			);
		} );
	} );
}

MiniInspectorEditor.create( document.querySelector( '#mini-inspector-heading-interactive' ), {
	plugins: [ Essentials, CustomHeading ],
	toolbar: []
} )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-heading-interactive-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
