/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

import ImageUpload from '../../src/imageupload';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const commonConfig = {
	plugins: [
		ArticlePluginSet,
		Indent,
		IndentBlock,
		ImageUpload,
		CloudServices,
		EasyImage,
		ImageResizeEditing,
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
		'resizeImage:original'
	]
};

const config2 = {
	...commonConfig,
	image: imageConfig2
};

ClassicEditor
	.create( document.querySelector( '#editor2' ), config2 )
	.then( editor => {
		window.editor2 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
