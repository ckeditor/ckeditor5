/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Code } from '@ckeditor/ckeditor5-basic-styles';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ImageResize } from '../../src/imageresize.js';
import { ImageSizeAttributes } from '../../src/imagesizeattributes.js';
import { ImageUpload } from '../../src/imageupload.js';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';

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
