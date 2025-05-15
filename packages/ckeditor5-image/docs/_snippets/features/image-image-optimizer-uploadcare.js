/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getViewportTopOffsetConfig } from '@snippets/index.js';
import { ImageOptimizerEditor } from './build-image-optimizer-source.js';

ImageOptimizerEditor
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
				top: getViewportTopOffsetConfig()
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
					'onedrive'
				]
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
