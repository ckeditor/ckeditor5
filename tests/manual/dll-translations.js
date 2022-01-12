/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

// Dll core.
import 'ckeditor5/build/ckeditor5-dll.js';

// Editor creators.
import '@ckeditor/ckeditor5-editor-classic/build/editor-classic';

// Plugins.
import '@ckeditor/ckeditor5-essentials/build/essentials';
import '@ckeditor/ckeditor5-autoformat/build/autoformat';
import '@ckeditor/ckeditor5-block-quote/build/block-quote';
import '@ckeditor/ckeditor5-basic-styles/build/basic-styles';
import '@ckeditor/ckeditor5-heading/build/heading';
import '@ckeditor/ckeditor5-image/build/image';
import '@ckeditor/ckeditor5-indent/build/indent';
import '@ckeditor/ckeditor5-link/build/link';
import '@ckeditor/ckeditor5-list/build/list';
import '@ckeditor/ckeditor5-media-embed/build/media-embed';
import '@ckeditor/ckeditor5-table/build/table';

// Translations:DE.
import 'ckeditor5/build/translations/de';
import '@ckeditor/ckeditor5-block-quote/build/translations/de';
import '@ckeditor/ckeditor5-basic-styles/build/translations/de';
import '@ckeditor/ckeditor5-heading/build/translations/de';
import '@ckeditor/ckeditor5-image/build/translations/de';
import '@ckeditor/ckeditor5-indent/build/translations/de';
import '@ckeditor/ckeditor5-link/build/translations/de';
import '@ckeditor/ckeditor5-list/build/translations/de';
import '@ckeditor/ckeditor5-media-embed/build/translations/de';
import '@ckeditor/ckeditor5-table/build/translations/de';

// Translations:PL.
import 'ckeditor5/build/translations/pl';
import '@ckeditor/ckeditor5-block-quote/build/translations/pl';
import '@ckeditor/ckeditor5-basic-styles/build/translations/pl';
import '@ckeditor/ckeditor5-heading/build/translations/pl';
import '@ckeditor/ckeditor5-image/build/translations/pl';
import '@ckeditor/ckeditor5-indent/build/translations/pl';
import '@ckeditor/ckeditor5-link/build/translations/pl';
import '@ckeditor/ckeditor5-list/build/translations/pl';
import '@ckeditor/ckeditor5-media-embed/build/translations/pl';
import '@ckeditor/ckeditor5-table/build/translations/pl';

const { ClassicEditor } = window.CKEditor5.editorClassic;

const { Image, ImageCaption, ImageStyle, ImageToolbar } = window.CKEditor5.image;
const { Link } = window.CKEditor5.link;
const { Bold, Italic } = window.CKEditor5.basicStyles;
const { Indent } = window.CKEditor5.indent;
const { List } = window.CKEditor5.list;
const { Table, TableToolbar } = window.CKEditor5.table;
const { Autoformat } = window.CKEditor5.autoformat;
const { BlockQuote } = window.CKEditor5.blockQuote;
const { Essentials } = window.CKEditor5.essentials;
const { Heading } = window.CKEditor5.heading;
const { MediaEmbed } = window.CKEditor5.mediaEmbed;
const { Paragraph } = window.CKEditor5.paragraph;

window.editors = {};

const editorElements = {
	en: document.getElementById( 'editor-en' ),
	de: document.getElementById( 'editor-de' ),
	pl: document.getElementById( 'editor-pl' )
};

// Copy the initial content based on the "en" editor.
editorElements.de.innerHTML = editorElements.en.innerHTML;
editorElements.pl.innerHTML = editorElements.en.innerHTML;

Promise.all( [
	createEditor( 'en' ),
	createEditor( 'de' ),
	createEditor( 'pl' )
] );

function getEditorConfigForLanguage( language ) {
	return {
		language,
		plugins: [
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			Indent,
			Italic,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			Table,
			TableToolbar
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	};
}

function createEditor( language ) {
	return ClassicEditor.create( editorElements[ language ], getEditorConfigForLanguage( language ) )
		.then( editor => {
			window.editors[ language ] = editor;

			CKEditorInspector.attach( {
				[ 'Editor:' + language ]: editor
			} );
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', { language }, error );
		} );
}

