/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	plugins: [ Essentials, Example ],
	toolbar: [],
	licenseKey: 'GPL'
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
