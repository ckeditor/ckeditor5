/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, Essentials, console, document */

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

DecoupledEditor.create( document.querySelector( '#mini-inspector-upcast-attribute' ), {
	plugins: [ Essentials, Image ]
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
