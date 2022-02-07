/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, Essentials, console, window, document */

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

DecoupledEditor.create( document.querySelector( '#mini-inspector-heading-interactive' ), {
	plugins: [ Essentials, CustomHeading ]
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
