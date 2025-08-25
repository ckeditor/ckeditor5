/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, ImageInsert, AutoImage } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link, LinkImage, AutoLink } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar, TableProperties, TableCellProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontColor, FontBackgroundColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Style } from '@ckeditor/ckeditor5-style';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor-classic-lists' ), {
		plugins: [
			Essentials, Autoformat, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
			List, Paragraph, Table, TableToolbar, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
			FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			CodeBlock, ListProperties, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
			EasyImage, ImageResize, ImageInsert, LinkImage, AutoImage, HtmlEmbed,
			AutoLink, Mention, TextTransformation, Alignment, IndentBlock, PageBreak, HorizontalLine,
			CloudServices, TextPartLanguage, SourceEditing, Style, GeneralHtmlSupport
		],
		toolbar: [
			'heading', 'style',
			'|',
			'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript', 'link',
			'|',
			'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'blockQuote', 'insertImage', 'insertTable', 'codeBlock',
			'|',
			'htmlEmbed',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'pageBreak', 'horizontalLine',
			'|',
			'textPartLanguage',
			'|',
			'sourceEditing',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		cloudServices: CS_CONFIG,
		placeholder: 'Type the content here!',
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
