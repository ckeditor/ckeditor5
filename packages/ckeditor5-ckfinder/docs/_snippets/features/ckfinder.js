/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-ckfinder' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'ckfinder', 'insertTable', 'mediaEmbed',
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
				'resizeImage:100',
				'resizeImage:200',
				'resizeImage:original'
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
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
			options: {
				height: 600,
				width: 800
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Insert image or file' ),
			text: 'Click to open the file manager.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
