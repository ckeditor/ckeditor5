/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Dll core.
import 'ckeditor5/build/ckeditor5-dll.js';

// Editor creators.
import '@ckeditor/ckeditor5-editor-classic/build/editor-classic.js';

// Plugins.
import '@ckeditor/ckeditor5-essentials/build/essentials.js';
import '@ckeditor/ckeditor5-autoformat/build/autoformat.js';
import '@ckeditor/ckeditor5-block-quote/build/block-quote.js';
import '@ckeditor/ckeditor5-basic-styles/build/basic-styles.js';
import '@ckeditor/ckeditor5-heading/build/heading.js';
import '@ckeditor/ckeditor5-image/build/image.js';
import '@ckeditor/ckeditor5-indent/build/indent.js';
import '@ckeditor/ckeditor5-link/build/link.js';
import '@ckeditor/ckeditor5-list/build/list.js';
import '@ckeditor/ckeditor5-media-embed/build/media-embed.js';
import '@ckeditor/ckeditor5-table/build/table.js';

// Translations:DE.
import 'ckeditor5/build/translations/de.js';
import '@ckeditor/ckeditor5-block-quote/build/translations/de.js';
import '@ckeditor/ckeditor5-basic-styles/build/translations/de.js';
import '@ckeditor/ckeditor5-heading/build/translations/de.js';
import '@ckeditor/ckeditor5-image/build/translations/de.js';
import '@ckeditor/ckeditor5-indent/build/translations/de.js';
import '@ckeditor/ckeditor5-link/build/translations/de.js';
import '@ckeditor/ckeditor5-list/build/translations/de.js';
import '@ckeditor/ckeditor5-media-embed/build/translations/de.js';
import '@ckeditor/ckeditor5-table/build/translations/de.js';

// Translations:PL.
import 'ckeditor5/build/translations/pl.js';
import '@ckeditor/ckeditor5-block-quote/build/translations/pl.js';
import '@ckeditor/ckeditor5-basic-styles/build/translations/pl.js';
import '@ckeditor/ckeditor5-heading/build/translations/pl.js';
import '@ckeditor/ckeditor5-image/build/translations/pl.js';
import '@ckeditor/ckeditor5-indent/build/translations/pl.js';
import '@ckeditor/ckeditor5-link/build/translations/pl.js';
import '@ckeditor/ckeditor5-list/build/translations/pl.js';
import '@ckeditor/ckeditor5-media-embed/build/translations/pl.js';
import '@ckeditor/ckeditor5-table/build/translations/pl.js';

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
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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

