/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import Font from '@ckeditor/ckeditor5-font/src/font.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

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
			ImageUpload,
			CloudServices,
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
			'link', 'blockQuote', 'uploadImage', 'mediaEmbed', 'insertTable', '|',
			'bulletedList', 'numberedList', 'outdent', 'indent', '|', 'undo', 'redo',
			'|'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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
