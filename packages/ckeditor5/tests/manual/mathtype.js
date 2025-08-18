/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Underline, Code, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Font } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { ImageUpload } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

import MathType from '@wiris/mathtype-ckeditor5';

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
			RemoveFormat,
			MathType
		],
		toolbar: [
			'MathType', 'ChemType', '|', 'heading', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'highlight', 'alignment', '|', 'bold', 'italic', 'underline', 'strikethrough', 'code', 'subscript',
			'superscript', 'removeFormat', '|', 'bulletedList', 'numberedList', 'outdent', 'indent', '|', 'link',
			'blockQuote', 'uploadImage', 'mediaEmbed', 'insertTable', '|', 'undo', 'redo'
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
