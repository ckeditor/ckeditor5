/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { DocumentList, DocumentListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Style from '@ckeditor/ckeditor5-style/src/style';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#editor-classic-lists' ), {
		plugins: [
			Essentials, Autoformat, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
			DocumentList, Paragraph, Table, TableToolbar, Underline, Strikethrough, Superscript, Subscript, Code, RemoveFormat,
			FindAndReplace, FontColor, FontBackgroundColor, FontFamily, FontSize, Highlight,
			CodeBlock, DocumentListProperties, TableProperties, TableCellProperties, TableCaption, TableColumnResize,
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
