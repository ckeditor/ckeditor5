/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor.builtinPlugins.push( PageBreak );

ClassicEditor
	.create( document.querySelector( '#snippet-page-break' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'link',
				'|',
				'imageUpload',
				'mediaEmbed',
				'insertTable',
				'pageBreak',
				'|',
				'undo',
				'redo',
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		// The "Log editor data" button logic.
		document.querySelector( '#log-data' ).addEventListener( 'click', () => {
			console.log( editor.getData() );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
