/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';

import ImageResize from '../../src/imageresize';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeUI from '../../src/imageresize/imageresizeui';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const commonConfig = {
	plugins: [
		ArticlePluginSet,
		ImageResize,
		Indent,
		IndentBlock,
		EasyImage
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
			name: 'imageResize:original',
			value: null
		},
		{
			name: 'imageResize:50',
			value: '50'
		},
		{
			name: 'imageResize:75',
			value: '75'
		}
	],
	toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:side', '|', 'imageResize' ],
	styles: [
		'full',
		'alignLeft',
		'side' // Purposely using side image instead right aligned image to make sure it works well with both style types.
	]
};

const config1 = {
	...commonConfig,
	plugins: [
		ArticlePluginSet,
		Indent,
		IndentBlock,
		EasyImage,
		ImageResizeEditing,
		ImageResizeUI
	],
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
			name: 'imageResize:original',
			value: null,
			icon: 'original'
		},
		{
			name: 'imageResize:50',
			value: '50',
			icon: 'medium'
		},
		{
			name: 'imageResize:75',
			value: '75',
			icon: 'large'
		}
	],
	toolbar: [
		'imageStyle:alignLeft',
		'imageStyle:full',
		'imageStyle:side', '|',
		'imageResize:50',
		'imageResize:75',
		'imageResize:original'
	],
	disableResizeHandles: true,
	styles: [
		'full',
		'alignLeft',
		'side' // Purposely using side image instead right aligned image to make sure it works well with both style types.
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
