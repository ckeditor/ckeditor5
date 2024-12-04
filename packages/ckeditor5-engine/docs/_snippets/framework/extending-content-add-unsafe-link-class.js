/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

function AddClassToUnsafeLinks( editor ) {
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			const viewSelection = viewWriter.document.selection;
			const viewElement = viewWriter.createAttributeElement( 'a', { class: 'unsafe-link' }, { priority: 5 } );

			if ( data.attributeNewValue.match( /http:\/\// ) ) {
				if ( data.item.is( 'selection' ) ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
				} else {
					viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
				}
			} else {
				viewWriter.unwrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
			}
		}, { priority: 'low' } );
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-link-unsafe-classes' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ AddClassToUnsafeLinks ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
