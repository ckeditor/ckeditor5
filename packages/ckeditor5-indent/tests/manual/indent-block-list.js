/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { AutoImage, ImageResize, ImageUpload, Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { HtmlComment, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { LinkImage, Link } from '@ckeditor/ckeditor5-link';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { TableCaption, Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const INITIAL_DATA = `
	<h3>Margins on ol/ul and li:</h3>
	<ol style="margin-left: 70px;">
		<li style="margin-left: 50px;">aaa
			<ol style="margin-left: 60px;">
				<li>bbb</li>
				<li style="margin-left: 80px;">ccc</li>
				<li style="margin-left: 50px;">ddd</li>
			</ol>
		</li>
		<li style="margin-left: 20px;">eee</li>
	</ol>
	<h3>Simple list (no indents):</h3>
	<ol>
		<li>aaa
			<ol>
				<li>bbb</li>
				<li>ccc</li>
				<li>ddd</li>
			</ol>
		</li>
		<li>eee</li>
	</ol>
`;

const INITIAL_DATA_CLASSES = `
	<h3>Margins on ol/ul and li:</h3>
	<ol class="indent-1">
		<li class="indent-1">aaa
			<ol class="indent-2">
				<li class="indent-2">bbb</li>
				<li class="indent-3">ccc</li>
				<li>ddd</li>
			</ol>
		</li>
		<li class="indent-4">eee</li>
	</ol>
	<h3>Simple list (no indents):</h3>
	<ol>
		<li>aaa
			<ol>
				<li>bbb</li>
				<li>ccc</li>
				<li>ddd</li>
			</ol>
		</li>
		<li>eee</li>
	</ol>
`;

const editorElement = document.querySelector( '#editor' );

const controls = {
	ghs: document.querySelector( '#ghs' ),
	pfo: document.querySelector( '#pfo' ),
	indent: document.querySelector( '#indent' ),
	indentBlock: document.querySelector( '#indentBlock' ),
	list: document.querySelector( '#list' ),
	listProperties: document.querySelector( '#listProperties' ),
	useClasses: document.querySelector( '#useClasses' )
};

controls.ghs.checked = false;
controls.pfo.checked = true;
controls.indent.checked = true;
controls.indentBlock.checked = true;
controls.list.checked = true;
controls.listProperties.checked = true;
controls.useClasses.checked = false;

let editor = null;

function getEditorConfig() {
	const plugins = [
		Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Italic, Link,
		MediaEmbed, Paragraph, Table, TableToolbar, CodeBlock, TableCaption, EasyImage, ImageResize, LinkImage,
		AutoImage, HtmlEmbed, HtmlComment, Alignment, PageBreak, HorizontalLine, ImageUpload,
		CloudServices, SourceEditing, RemoveFormat
	];

	if ( controls.ghs.checked ) {
		plugins.push( GeneralHtmlSupport );
	}

	if ( controls.pfo.checked ) {
		plugins.push( PasteFromOffice );
	}

	if ( controls.indentBlock.checked ) {
		plugins.push( IndentBlock );
	}

	if ( controls.indent.checked ) {
		plugins.push( Indent );
	}

	if ( controls.list.checked ) {
		plugins.push( List );
	}

	if ( controls.listProperties.checked ) {
		plugins.push( ListProperties );
	}

	const config = {
		plugins,
		toolbar: [
			'sourceEditing', '|',
			'numberedList', 'bulletedList', '|',
			'outdent', 'indent', '|',
			'heading', '|',
			'removeFormat', '|',
			'bold', 'italic', 'link', '|',
			'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock', '|',
			'htmlEmbed', '|',
			'alignment', '|',
			'pageBreak', 'horizontalLine', '|',
			'undo', 'redo'
		],
		cloudServices: CS_CONFIG,
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
		placeholder: 'Type the content here!',
		htmlEmbed: {
			showPreviews: true,
			sanitizeHtml: html => ( { html, hasChange: false } )
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
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
	};

	config.indentBlock = controls.useClasses.checked ? { classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ] } : {};

	return config;
}

function createEditor() {
	const initialize = () =>
		ClassicEditor.create( editorElement, getEditorConfig() )
			.then( newEditor => {
				editor = newEditor;
				window.editor = editor;
				editor.setData( controls.useClasses.checked ? INITIAL_DATA_CLASSES : INITIAL_DATA );
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
