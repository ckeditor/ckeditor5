/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	BalloonEditor as BalloonEditorBase,
	Essentials,
	Autoformat,
	BlockToolbar,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	EasyImage,
	Heading,
	Title,
	Image,
	ImageInsert,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	CloudServices
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

class BalloonEditor extends BalloonEditorBase {}

BalloonEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	BlockToolbar,
	Bold,
	Italic,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	CloudServices,
	EasyImage,
	Heading,
	Image,
	ImageInsert,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	PictureEditing,
	Table,
	TableToolbar,
	TextTransformation
];

BalloonEditor.defaultConfig = {
	blockToolbar: [
		'heading',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'|',
		'insertImage',
		'blockQuote',
		'insertTable',
		'mediaEmbed',
		'|',
		'undo',
		'redo'
	],
	toolbar: {
		items: [
			'bold',
			'italic',
			'link'
		]
	},
	image: {
	// having this one here does not make the slightest sense
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:wrapText',
			'|',
			'toggleImageCaption',
			'imageTextAlternative',
			'ckboxImageEdit'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

BalloonEditor.builtinPlugins.push( Title );

BalloonEditor
	.create( document.querySelector( '#snippet-title' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		blockToolbar: [
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'insertImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed'
		]
	} )
	.then( editor => {
		window.editor = editor;

		const titlePlugin = editor.plugins.get( 'Title' );
		const titleConsole = document.querySelector( '#title-console__title' );
		const bodyConsole = document.querySelector( '#title-console__body' );
		const dataConsole = document.querySelector( '#title-console__data' );

		window.umberto.afterReady( () => {
			editor.model.document.on( 'change:data', window.umberto.throttle( async () => {
				await titleConsole.codeBlock.setCode( titlePlugin.getTitle() );
				await bodyConsole.codeBlock.setCode( titlePlugin.getBody() );
				await dataConsole.codeBlock.setCode( editor.getData() );
			}, 100 ) );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
