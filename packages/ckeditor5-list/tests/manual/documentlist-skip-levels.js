/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { ImageResize, ImageUpload, Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { HtmlComment, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { LinkImage, Link } from '@ckeditor/ckeditor5-link';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { TableCaption, Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { TodoList } from '../../src/todolist.js';

import { List } from '../../src/list.js';
import { ListProperties } from '../../src/listproperties.js';

const editorElement = document.querySelector( '#editor' );
const INITIAL_DATA = editorElement.innerHTML;

const controls = {
	skipLevels: document.querySelector( '#skipLevels' ),
	indentBlock: document.querySelector( '#indentBlock' ),
	ghs: document.querySelector( '#ghs' ),
	pfo: document.querySelector( '#pfo' ),
	listProperties: document.querySelector( '#listProperties' )
};

let editor = null;

function getEditorConfig() {
	const plugins = [
		Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
		MediaEmbed, Paragraph, Table, TableToolbar, CodeBlock, TableCaption, ImageResize, LinkImage,
		HtmlEmbed, HtmlComment, Alignment, PageBreak, HorizontalLine, ImageUpload,
		SourceEditing, List, TodoList
	];

	if ( controls.indentBlock.checked ) {
		plugins.push( IndentBlock );
	}

	if ( controls.ghs.checked ) {
		plugins.push( GeneralHtmlSupport );
	}

	if ( controls.pfo.checked ) {
		plugins.push( PasteFromOffice );
	}

	if ( controls.listProperties.checked ) {
		plugins.push( ListProperties );
	}

	const config = {
		plugins,
		toolbar: [
			'sourceEditing', '|',
			'numberedList', 'bulletedList', 'todoList', '|',
			'outdent', 'indent', '|',
			'heading', '|',
			'bold', 'italic', 'link', '|',
			'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', '|',
			'htmlEmbed', '|',
			'alignment', '|',
			'pageBreak', 'horizontalLine', '|',
			'undo', 'redo'
		],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
			]
		},
		image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original size',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml: html => ( { html, hasChange: false } )
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			},
			allowSkipLevels: controls.skipLevels.checked
		},
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
		menuBar: {
			isVisible: true
		}
	};

	return config;
}

function createEditor() {
	const initialize = () =>
		ClassicEditor.create( {
			...getEditorConfig(),
			attachTo: editorElement
		} ).then( newEditor => {
			editor = newEditor;
			window.editor = editor;
			editor.setData( INITIAL_DATA );
		} );

	return Promise.resolve()
		.then( () => editor && editor.destroy() )
		.then( initialize )
		.catch( err => console.error( err ) );
}

createEditor();

Object.values( controls ).forEach( input => {
	input.addEventListener( 'change', () => {
		createEditor();
	} );
} );
