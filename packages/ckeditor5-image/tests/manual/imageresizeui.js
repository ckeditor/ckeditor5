/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageResizeUI from '../../src/imageresizeui';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const commonConfig = {
	plugins: [
		ArticlePluginSet,
		ImageResizeUI,
		Indent,
		IndentBlock,
		EasyImage
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link',
		'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo', 'outdent', 'indent' ],
	image: {
		imageResize: [
			{
				name: 'imageResize:50',
				label: 'Resize image of 50%',
				value: '50%'
			},
			{
				name: 'imageResize:75',
				label: 'Resize image of 75%',
				value: '75%'
			}
		],
		toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:side', '|', 'imageResize' ],
		styles: [
			'full',
			'alignLeft',
			'side' // Purposely using side image instead right aligned image to make sure it works well with both style types.
		]
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
		tableToolbar: [ 'bold', 'italic' ]
	},
	cloudServices: CS_CONFIG
};

ClassicEditor
	.create( document.querySelector( '#editor' ), commonConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
