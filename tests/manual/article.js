/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Underline ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		let biCount = 0;

		editor.editing.view.document.on( 'beforeinput', ( evt, data ) => {
			console.group( 'beforeInput debug #' + biCount++ );

			const domEvent = data.domEvent;
			const { inputType, isComposing, data: eventData } = domEvent;
			const targetRanges = Array.from( domEvent.getTargetRanges() );
			const dataTransferText = domEvent.dataTransfer && domEvent.dataTransfer.getData( 'text/plain' );

			console.log( 'domEvent:', domEvent );
			console.log( 'targetRanges:', targetRanges );
			console.log( 'inputType:', inputType );
			console.log( `data: "${ eventData }"` );
			console.log( `dataTransferText: "${ dataTransferText }"` );
			console.log( 'isComposing:', isComposing );

			console.groupEnd();
		}, { priority: 'highest' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
