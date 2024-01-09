/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-responsive' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'ckbox', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		image: {
			toolbar: [
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'resizeImage:100',
				'resizeImage:200',
				'resizeImage:original',
				'|',
				'ckboxImageEdit'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					icon: 'original'
				},
				{
					name: 'resizeImage:100',
					value: '100',
					icon: 'medium'
				},
				{
					name: 'resizeImage:200',
					value: '200',
					icon: 'large'
				}
			],
			resizeUnit: 'px'
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		ckbox: {
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.buttonView && item.buttonView.label === 'CKBox' ),
			text: 'Click here to insert an image.',
			tippyOptions: {
				placement: 'bottom'
			},
			editor
		} );
	} )
	.catch( err => {
		console.error( err );
	} );
