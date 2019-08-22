/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: CS_CONFIG,
		plugins: [ ArticlePluginSet, Alignment, EasyImage ],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote',
			'alignment', '|', 'imageUpload', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
