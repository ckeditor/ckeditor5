/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	plugins: [ Essentials, Image ],
	toolbar: [],
	licenseKey: 'GPL'
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
