/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals ClassicEditor, console, window, document, LICENSE_KEY */

ClassicEditor
	.create( document.querySelector( '#image-optimizer-uploadcare' ), {
		removePlugins: [ 'CKBox', 'CKBoxImageEdit', 'LinkImage' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'imageInsert', 'insertTable', 'mediaEmbed',
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
				'imageStyle:wrapText',
				'|',
				'uploadcareImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		uploadcare: {
			pubkey: '0132b29be08ee83d5ae0',
			allowExternalImagesEditing: [ /^data:/, 'origin' ],
			uploader: {
				sourceList: [
					'local',
					'url',
					'dropbox',
					'gdrive',
					'facebook',
					'gphotos',
					'instagram',
					'onedrive'
				]
			}
		},
		licenseKey: LICENSE_KEY
	} )
	.catch( err => {
		console.error( err.stack );
	} );
