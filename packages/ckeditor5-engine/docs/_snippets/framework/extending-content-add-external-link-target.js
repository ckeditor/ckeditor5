/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

function AddTargetToExternalLinks( editor ) {
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;
			const viewElement = viewWriter.createAttributeElement( 'a', {
				target: '_blank'
			}, {
				priority: 5
			} );

			if ( data.attributeNewValue.match( /ckeditor\.com/ ) ) {
				viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
			} else {
				if ( data.item.is( 'selection' ) ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
				} else {
					viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
				}
			}
		}, { priority: 'low' } );
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-link-external' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ AddTargetToExternalLinks ],
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
