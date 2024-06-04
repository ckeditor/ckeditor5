/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import SpecialCharacters from '../../src/specialcharacters.js';
import SpecialCharactersEssentials from '../../src/specialcharactersessentials.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: CS_CONFIG,
		plugins: [
			ArticlePluginSet,
			ImageUpload,
			CloudServices,
			EasyImage,
			SpecialCharacters,
			SpecialCharactersEssentials
		],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'numberedList', 'bulletedList',
			'|',
			'link', 'blockquote', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|',
			'undo', 'redo',
			'|',
			'specialCharacters'
		],
		menuBar: { isVisible: true },
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
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
