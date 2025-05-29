/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';

import ImageUpload from '../../src/imageupload.js';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting.js';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons.js';
import ImageCustomResizeUI from '../../src/imageresize/imagecustomresizeui.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const commonConfig = {
	plugins: [
		ArticlePluginSet,
		Indent,
		IndentBlock,
		ImageUpload,
		CloudServices,
		EasyImage,
		ImageResizeEditing,
		ImageCustomResizeUI,
		ImageResizeButtons
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link',
		'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo', 'outdent', 'indent' ],
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
		tableToolbar: [ 'bold', 'italic' ]
	},
	cloudServices: CS_CONFIG
};

// Editor 1

const imageConfig1 = {
	resizeUnit: '%',
	resizeOptions: [
		{
			name: 'resizeImage:original',
			value: null
		},
		{
			name: 'resizeImage:50',
			value: '50'
		},
		{
			name: 'resizeImage:75',
			value: '75'
		}
	],
	toolbar: [ 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'toggleImageCaption', 'resizeImage' ]
};

const config1 = {
	...commonConfig,
	image: imageConfig1
};

ClassicEditor
	.create( document.querySelector( '#editor1' ), config1 )
	.then( editor => {
		window.editor1 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Editor 2

const imageConfig2 = {
	resizeUnit: '%',
	resizeOptions: [
		{
			name: 'resizeImage:original',
			value: null,
			icon: 'original'
		},
		{
			name: 'resizeImage:custom',
			value: 'custom',
			icon: 'custom'
		},
		{
			name: 'resizeImage:50',
			value: '50',
			icon: 'medium'
		},
		{
			name: 'resizeImage:75',
			value: '75',
			icon: 'large'
		}
	],
	toolbar: [
		'imageStyle:inline',
		'imageStyle:wrapText',
		'imageStyle:breakText',
		'imageStyle:side', '|', // Purposely using side image to make sure it works well with both style types.
		'toggleImageCaption', '|',
		'resizeImage:50',
		'resizeImage:75',
		'resizeImage:original',
		'resizeImage:custom'
	]
};

const config2 = {
	...commonConfig,
	image: imageConfig2,
	toolbar: [
		...commonConfig.toolbar, '|',
		'resizeImage:50',
		'resizeImage:75',
		'resizeImage:original',
		'resizeImage:custom'
	]
};

ClassicEditor
	.create( document.querySelector( '#editor2' ), config2 )
	.then( editor => {
		window.editor2 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
