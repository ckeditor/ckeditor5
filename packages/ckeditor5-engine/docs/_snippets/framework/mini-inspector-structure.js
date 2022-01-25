/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, Essentials, console, window, document */

function Structure( editor ) {
	editor.model.schema.register( 'myElement', {
		inheritAllFrom: '$block'
	} );

	editor.conversion.elementToStructure( {
		model: 'myElement',
		view: ( modelElement, { writer, slotFor } ) => {
			return writer.createContainerElement( 'div', { class: 'wrapper' }, [
				writer.createContainerElement( 'p', null, [
					slotFor( 'children' )
				] )
			] );
		}
	} );
}

DecoupledEditor.create( document.querySelector( '#mini-inspector-structure' ), {
	plugins: [ Essentials, Structure ]
} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			writer.insertElement( 'myElement', 0 );
		} );

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-structure-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
