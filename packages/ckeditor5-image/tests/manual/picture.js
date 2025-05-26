/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import AutoImage from '../../src/autoimage.js';
import ImageResize from '../../src/imageresize.js';
import ImageUpload from '../../src/imageupload.js';
import PictureEditing from '../../src/pictureediting.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			CloudServices,
			EasyImage,
			ImageResize,
			LinkImage,
			AutoImage,
			PictureEditing,
			ImageUpload
		],
		toolbar: {
			items: [
				'uploadImage',
				'-',
				'heading',
				'|',
				'bold', 'italic', 'link',
				'|',
				'bulletedList', 'numberedList',
				'|',
				'insertTable',
				'|',
				'undo', 'redo'
			],
			shouldNotGroupWhenFull: true
		},
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells'
			]
		},
		image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original size',
					value: null
				},
				{
					name: 'resizeImage:custom',
					label: 'Custom size',
					value: 'custom'
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		// Simulate an upload adapter that supports sources.
		editor.plugins.get( 'ImageUploadEditing' ).on( 'uploadComplete', ( evt, { data } ) => {
			data.default = 'logo-wide.png';
			data.sources = [
				{ srcset: 'logo-square.png', type: 'image/png', media: '(max-width: 800px)' },
				{ srcset: 'logo-wide.png', type: 'image/png', media: '(min-width: 800px)' }
			];
		}, { priority: 'high' } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
