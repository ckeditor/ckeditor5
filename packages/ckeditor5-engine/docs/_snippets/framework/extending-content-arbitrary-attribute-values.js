/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

function HandleFontSizeValue( editor ) {
	// Add a special catch-all converter for the font size feature.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'span',
			styles: {
				'font-size': /[\s\S]+/
			}
		},
		model: {
			key: 'fontSize',
			value: viewElement => {
				const value = parseFloat( viewElement.getStyle( 'font-size' ) ).toFixed( 0 );

				// It might be needed to further convert the value to meet business requirements.
				// In the sample the font size is configured to handle only the sizes:
				// 12, 14, 'default', 18, 20, 22, 24, 26, 28, 30
				// Other sizes will be converted to the model but the UI might not be aware of them.

				// The font size feature expects numeric values to be Number, not String.
				return parseInt( value );
			}
		},
		converterPriority: 'high'
	} );

	// Add a special converter for the font size feature to convert all (even not configured)
	// model attribute values.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: {
			key: 'fontSize'
		},
		view: ( modelValue, { writer: viewWriter } ) => {
			return viewWriter.createAttributeElement( 'span', {
				style: `font-size:${ modelValue }px`
			} );
		},
		converterPriority: 'high'
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-arbitrary-attribute-values' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ HandleFontSizeValue ],
		toolbar: {
			items: [ 'heading', '|', 'bold', 'italic', '|', 'fontSize' ]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

