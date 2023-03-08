/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config';

ClassicEditor
	.create( document.querySelector( '#snippet-ckbox' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'ckbox', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
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
				'resizeImage:25',
				'resizeImage:50',
				'resizeImage:original'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					icon: 'original'
				},
				{
					name: 'resizeImage:25',
					value: '25',
					icon: 'small'
				},
				{
					name: 'resizeImage:50',
					value: '50',
					icon: 'medium'
				}
			],
			resizeUnit: '%'
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Open file manager' ),
			text: 'Click to open the file manager.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
