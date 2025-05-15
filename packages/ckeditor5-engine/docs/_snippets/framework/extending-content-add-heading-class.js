/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

function AddClassToAllHeading1( editor ) {
	editor.conversion.for( 'downcast' ).add( dispatcher => {
		dispatcher.on( 'insert:heading1', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;

			viewWriter.addClass( 'my-heading', conversionApi.mapper.toViewElement( data.item ) );
		}, { priority: 'low' } );
	} );
}

ClassicEditor
	.create( document.querySelector( '#snippet-heading-class' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ AddClassToAllHeading1 ],
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
