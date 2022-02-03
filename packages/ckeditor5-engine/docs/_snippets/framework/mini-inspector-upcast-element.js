/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, Essentials, console, document */

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

DecoupledEditor.create( document.querySelector( '#mini-inspector-upcast-element' ), {
	plugins: [ Essentials, Example ]
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
