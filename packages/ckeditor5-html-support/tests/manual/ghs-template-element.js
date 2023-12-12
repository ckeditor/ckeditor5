/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet, Underline, Strikethrough, Code, CodeBlock, LinkImage,
			HtmlEmbed, HorizontalLine, ImageUpload, RemoveFormat, SourceEditing, GeneralHtmlSupport
		],
		toolbar: [
			'sourceEditing',
			'|',
			'heading',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock',
			'|',
			'htmlEmbed',
			'|',
			'undo', 'redo'
		],
		htmlSupport: {
			allow: [
				{
					name: /./,
					styles: true,
					attributes: true,
					classes: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
