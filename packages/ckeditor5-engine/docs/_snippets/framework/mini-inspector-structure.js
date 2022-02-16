/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, Essentials, Paragraph, console, window, document */

function Structure( editor ) {
	editor.model.schema.register( 'myElement', {
		allowWhere: '$block',
		isObject: true,
		isBlock: true,
		allowContentOf: '$root'
	} );

	editor.conversion.for( 'downcast' ).elementToStructure( {
		model: 'myElement',
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement( 'div', { class: 'wrapper' }, [
				writer.createContainerElement( 'div', { class: 'inner-wrapper' }, [
					writer.createSlot()
				] )
			] );
		}
	} );

	editor.conversion.for( 'upcast' ).add( dispatcher => {
		// Look for every view div element.
		dispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
			// Get all the necessary items from the conversion API object.
			const {
				consumable,
				writer,
				safeInsert,
				convertChildren,
				updateConversionResult
			} = conversionApi;

			// Get view item from data object.
			const { viewItem } = data;

			// Define elements consumables.
			const wrapper = { name: true, classes: 'wrapper' };
			const innerWrapper = { name: true, classes: 'inner-wrapper' };

			// Tests if the view element can be consumed.
			if ( !consumable.test( viewItem, wrapper ) ) {
				return;
			}

			// Check if there is only one child.
			if ( viewItem.childCount !== 1 ) {
				return;
			}

			// Get the first child element.
			const firstChildItem = viewItem.getChild( 0 );

			// Check if the first element is a div.
			if ( !firstChildItem.is( 'element', 'div' ) ) {
				return;
			}

			// Tests if the first child element can be consumed.
			if ( !consumable.test( firstChildItem, innerWrapper ) ) {
				return;
			}

			// Create model element.
			const modelElement = writer.createElement( 'myElement' );

			// Insert element on a current cursor location.
			if ( !safeInsert( modelElement, data.modelCursor ) ) {
				return;
			}

			// Consume the main outer wrapper element.
			consumable.consume( viewItem, wrapper );
			// Consume the inner wrapper element.
			consumable.consume( firstChildItem, innerWrapper );

			// Handle children conversion inside inner wrapper element.
			convertChildren( firstChildItem, modelElement );

			// Necessary function call to help setting model range and cursor
			// for some specific cases when elements being split.
			updateConversionResult( modelElement, data );
		} );
	} );
}

DecoupledEditor.create( document.querySelector( '#mini-inspector-structure' ), {
	plugins: [ Essentials, Paragraph, Structure ]
} )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-structure-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
