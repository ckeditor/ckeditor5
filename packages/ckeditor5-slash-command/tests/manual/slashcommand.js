/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import List from '@ckeditor/ckeditor5-list/src/list';
import Table from '@ckeditor/ckeditor5-table/src/table';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import SlashCommand from '../../src/slashcommand';

ClassicEditor
	.create( global.document.querySelector( '#editor1' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			Bold, Clipboard, Enter, Italic, Link, Paragraph, SlashCommand, ShiftEnter, Typing,
			Underline, Undo, Image, ImageCaption, ImageToolbar, ImageResize, BlockQuote, List,
			Strikethrough, Table, MediaEmbed, Heading
		],
		toolbar: [ 'heading', '|', 'italic', 'bold', 'link', 'underline', 'strikethrough', '|', 'undo', 'redo', 'blockquote', '|',
			'numberedList', 'bulletedList', '|', 'insertTable', 'mediaEmbed' ],
		mention: {
			dropdownLimit: 8
		}
	} )
	.then( editor => {
		window.editor1 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( global.document.querySelector( '#editor2' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			Bold, Clipboard, Enter, Italic, Link, Paragraph, SlashCommand, ShiftEnter, Typing,
			Underline, Undo, Image, ImageCaption, ImageToolbar, ImageResize, BlockQuote, List,
			Strikethrough, Table, MediaEmbed, Heading
		],
		toolbar: [ 'heading', '|', 'italic', 'bold', 'link', 'underline', 'strikethrough', '|', 'undo', 'redo', 'blockquote', '|',
			'numberedList', 'bulletedList', '|', 'insertTable', 'mediaEmbed' ],
		mention: {
			dropdownLimit: 5,
			layout: 'clean'
		}
	} )
	.then( editor => {
		window.editor2 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
