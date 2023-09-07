/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageResize from '../../src/imageresize';
import ImageSizeAttributes from '../../src/imagesizeattributes';
import ImageUpload from '../../src/imageupload';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const commonConfig = {
	plugins: [
		ArticlePluginSet,
		ImageResize,
		Code,
		ImageSizeAttributes,
		ImageUpload,
		Indent,
		IndentBlock,
		CloudServices,
		PasteFromOffice,
		GeneralHtmlSupport
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link',
		'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo', 'outdent', 'indent' ],
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|', 'toggleImageCaption', 'resizeImage' ]
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
		tableToolbar: [ 'bold', 'italic' ]
	},
	htmlSupport: {
		allow: [
			// Enables all HTML features.
			{
				name: /.*/,
				attributes: true,
				classes: true,
				styles: true
			}
		],
		disallow: [
			{
				attributes: [
					{ key: /^on(.*)/i, value: true },
					{ key: /.*/, value: /(\b)(on\S+)(\s*)=|javascript:|(<\s*)(\/*)script/i },
					{ key: /.*/, value: /data:(?!image\/(png|jpeg|gif|webp))/i }
				]
			},
			{ name: 'script' }
		]
	},
	cloudServices: CS_CONFIG
};

ClassicEditor
	.create( document.querySelector( '#editor-ghs-with-width-height-attributes' ), commonConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
