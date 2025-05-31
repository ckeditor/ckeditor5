/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Mention from '@ckeditor/ckeditor5-mention/src/mention.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import TextPartLanguage from '@ckeditor/ckeditor5-language/src/textpartlanguage.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import Style from '@ckeditor/ckeditor5-style/src/style.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';

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
