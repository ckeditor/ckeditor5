/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import { BalloonEditor as BalloonEditorBase } from '@ckeditor/ckeditor5-editor-balloon';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading, Title } from '@ckeditor/ckeditor5-heading';
import { Image, ImageInsert, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

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
				top: window.getViewportTopOffsetConfig()
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
		const titleConsole = new Console( document.querySelector( '.title-console__title' ), 'plaintext' );
		const bodyConsole = new Console( document.querySelector( '.title-console__body' ), 'html' );
		const dataConsole = new Console( document.querySelector( '.title-console__data' ), 'html' );

		editor.model.document.on( 'change:data', () => {
			titleConsole.update( titlePlugin.getTitle() );
			bodyConsole.update( titlePlugin.getBody() );
			dataConsole.update( editor.getData() );
		} );

		// Load data.
		titleConsole.update( '' );
		bodyConsole.update( '<p>&nbsp;</p>' );
		dataConsole.update( '<p>&nbsp;</p>' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

class Console {
	constructor( element, language ) {
		this.element = element;
		this.language = language;
		this.consoleUpdates = 0;
		this.previousData = '';
	}

	update( data ) {
		if ( this.previousData == data ) {
			return;
		}

		this.previousData = data;
		const element = this.element;

		this.consoleUpdates++;

		element.classList.add( 'updated' );

		const content = window.Prism.highlight( data, window.Prism.languages[ this.language ], this.language );

		element.innerHTML = `'${ content }'`;

		setTimeout( () => {
			if ( --this.consoleUpdates == 0 ) {
				element.classList.remove( 'updated' );
			}
		}, 500 );
	}
}
