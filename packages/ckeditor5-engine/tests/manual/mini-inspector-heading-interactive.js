/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import MiniCKEditorInspector from '../../../../scripts/docs/mini-inspector/miniinspector';
// import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/* globals console, window, document */

// class ExampleStructure extends Plugin {
// 	init() {
// 		this.editor.model.schema.register( 'myElement', {
// 			inheritAllFrom: '$block'
// 		} );

// 		this.editor.conversion.for( 'downcast' ).elementToStructure( {
// 			model: 'myElement',
// 			view: ( modelElement, { writer } ) => {
// 				return writer.createContainerElement(
// 					'div',
// 					{ class: 'wrapper' },
// 					[ writer.createContainerElement( 'p' ) ]
// 				);
// 			}
// 		} );
// 	}
// }

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

	const dropdown = document.getElementById( 'mini-inspector-heading-interactive-dropdown' );

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
	plugins: [ Essentials, Paragraph, CustomHeading ]
} )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-heading-interactive-container' )
		);

		// editor.model.change( writer => {
		// 	return writer.insertElement(
		// 		writer.createElement( 'myElement' ),
		// 		editor.model.document.getRoot(),
		// 		0
		// 	);
		// } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
