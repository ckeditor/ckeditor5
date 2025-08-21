/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { ImageResize, ImageUpload } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { TableCellProperties, TableProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

import { PasteFromOffice } from '../../../../src/pastefromoffice.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code,
			FontColor, FontBackgroundColor, FontFamily, FontSize,
			CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption,
			TableColumnResize, EasyImage, ImageResize, LinkImage,
			PageBreak,
			ImageUpload, CloudServices,
			GeneralHtmlSupport,
			PasteFromOffice
		],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'blockQuote', 'uploadImage', 'insertTable', 'codeBlock',
			'|',
			'pageBreak',
			'|',
			'undo', 'redo'
		],
		htmlSupport: {
			allow: [
				{
					name: /^.*$/,
					styles: true,
					attributes: true,
					classes: true
				}
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
