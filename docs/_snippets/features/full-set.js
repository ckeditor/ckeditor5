/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';

ClassicEditor
	.create( document.querySelector( '#snippet-full-features-set' ), {
		plugins: [
			Essentials,
			Paragraph,
			Heading,
			Bold,
			Italic,
			Underline,
			Strikethrough,
			RemoveFormat,
			List,
			TodoList,
			Indent,
			Alignment,
			FontSize,
			FontFamily,
			FontColor,
			FontBackgroundColor,
			BlockQuote,
			Link,
			Image,
			ImageCaption,
			ImageResize,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			MediaEmbed,
			Table,
			TableToolbar,
			PasteFromOffice,
			PageBreak,
			HorizontalLine,
			WordCount
		],
		toolbar: [
			'heading',
			'|', 'bold', 'italic', 'underline', 'strikethrough', 'removeFormat',
			'|', 'numberedList', 'bulletedList', 'todoList',
			'|', 'alignment',
			'|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|', 'blockQuote', 'code', 'link', 'image', 'insertTable', 'mediaEmbed', 'indent', 'outdent',
			'|', 'pageBreak', 'horizontalLine',
			'|', 'undo', 'redo'
		],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
	} )
	.then( editor => {
		// Expose for playing in the console.
		window.editor = editor;

		const wordCountPlugin = editor.plugins.get( 'WordCount' );
		const wordCountWrapper = document.getElementById( 'word-count' );

		wordCountWrapper.appendChild( wordCountPlugin.wordCountContainer );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
