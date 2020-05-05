/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function ConvertDivAttributes( editor ) {
	// Allow <div> elements in the model.
	editor.model.schema.register( 'div', {
		allowWhere: '$block',
		allowContentOf: '$root'
	} );

	// Allow <div> elements in the model to have all attributes.
	editor.model.schema.addAttributeCheck( context => {
		if ( context.endsWith( 'div' ) ) {
			return true;
		}
	} );

	// View-to-model converter converting a view <div> with all its attributes to the model.
	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'div',
		model: ( viewElement, modelWriter ) => {
			return modelWriter.createElement( 'div', viewElement.getAttributes() );
		}
	} );

	// Model-to-view converter for the <div> element (attrbiutes are converted separately).
	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'div',
		view: 'div'
	} );

	// Model-to-view converter for <div> attributes.
	// Note that a lower-level, event-based API is used here.
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
			// Convert <div> attributes only.
			if ( data.item.name != 'div' ) {
				return;
			}

			const viewWriter = conversionApi.writer;
			const viewDiv = conversionApi.mapper.toViewElement( data.item );

			// In the model-to-view conversion we convert changes. An attribute can be added or removed or changed.
			// The below code handles all 3 cases.
			if ( data.attributeNewValue ) {
				viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
			} else {
				viewWriter.removeAttribute( data.attributeKey, viewDiv );
			}
		} );
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-div-attributes' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ ConvertDivAttributes ],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
