/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { ImageResize, ImageUpload } from '@ckeditor/ckeditor5-image';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { TableCellProperties, TableProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';

import { GeneralHtmlSupport } from '../../src/generalhtmlsupport.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, Underline, Strikethrough, Superscript, Subscript, Code,
			FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			CodeBlock, TodoList, ListProperties, TableProperties, TableCellProperties, TableCaption,
			TableColumnResize, EasyImage, ImageResize, LinkImage, HtmlEmbed,
			Alignment, IndentBlock,
			PageBreak, HorizontalLine,
			ImageUpload, CloudServices,
			RemoveFormat,
			SourceEditing,
			GeneralHtmlSupport
		],
		toolbar: [
			'sourceEditing',
			'|',
			'heading',
			'|',
			'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
			'|',
			'htmlEmbed',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'pageBreak', 'horizontalLine',
			'|',
			'undo', 'redo',
			'|',
			'RemoveFormat'
		],
		htmlSupport: {
			allow: [
				{
					name: /^.*$/,
					styles: true,
					attributes: true,
					classes: true
				}
			],
			allowEmpty: [ 'i' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
