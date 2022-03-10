/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document, ListProperties */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-paste-from-office' ), {
		extraPlugins: [ ListProperties ],
		toolbar: {
			items: [
				'heading',
				'|',
				'fontSize',
				'fontFamily',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'-',
				'alignment',
				'|',
				'numberedList',
				'bulletedList',
				'|',
				'outdent',
				'indent',
				'|',
				'link',
				'uploadImage',
				'insertTable',
				'horizontalLine',
				'|',
				'undo',
				'redo'
			],
			shouldNotGroupWhenFull: true
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties'
			]
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ],
			supportAllValues: true
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: false
			}
		},
		placeholder: 'Paste the content here to test the feature.',
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
		// Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
		window.preventPasteFromOfficeNotification = true;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
