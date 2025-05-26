/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageResize from '../../src/imageresize.js';
import ImageSizeAttributes from '../../src/imagesizeattributes.js';
import ImageUpload from '../../src/imageupload.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

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
		EasyImage,
		PasteFromOffice
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
	cloudServices: CS_CONFIG
};

ClassicEditor
	.create( document.querySelector( '#editor-width-height-attributes' ), commonConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
