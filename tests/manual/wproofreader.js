/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: CS_CONFIG,
		plugins: [
			ArticlePluginSet,
			Alignment,
			Underline,
			Strikethrough,
			Code,
			Subscript,
			Superscript,
			EasyImage,
			Font,
			Highlight,
			Indent,
			Mention,
			PasteFromOffice,
			RemoveFormat
		],
		toolbar: [
			'heading', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'highlight', 'alignment', '|',
			'bold', 'italic', 'underline', 'strikethrough', 'code', 'subscript', 'superscript', 'removeFormat', '|',
			'link', 'blockQuote', 'imageUpload', 'mediaEmbed', 'insertTable', '|',
			'bulletedList', 'numberedList', 'indent', 'outdent', '|', 'undo', 'redo',
			'|'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		mediaEmbed: {
			previewsInData: true,
			toolbar: [ 'blockQuote' ]
		},
		mention: {
			feeds: [ {
				marker: '@',
				feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
			} ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	} )
	.then( newEditor => {
		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
