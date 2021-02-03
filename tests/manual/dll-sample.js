/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */
import 'ckeditor5/build/ckeditor5-dll.js';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic/build/editor-classic.js';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled/build/editor-decoupled.js';
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline/build/editor-inline.js';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon/build/editor-balloon.js';

import { Essentials } from '@ckeditor/ckeditor5-essentials/build/essentials.js';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles/build/basic-styles.js';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed/build/html-embed.js';
import { Image } from '@ckeditor/ckeditor5-image/build/image.js';
import { Table, TableToolbar, TableCellProperties, TableProperties } from '@ckeditor/ckeditor5-table/build/table.js';

const { Plugin } = window.CKEditor5.core;
const { ButtonView } = window.CKEditor5.ui;
const { Paragraph } = window.CKEditor5.paragraph;

// Create ad-hoc plugin.
class AdHocPlugin extends Plugin {
	constructor( editor ) {
		super( editor );

		editor.ui.componentFactory.add( 'ad-hoc-button', locale => {
			const button = new ButtonView( locale );

			button.set( {
				icon: false,
				withText: true,
				label: 'Ad-hoc'
			} );

			button.on( 'execute', () => console.log( 'It works!' ) );

			return button;
		} );
	}
}

const config = {
	extraPlugins: [
		Essentials,
		Paragraph,
		Bold,
		Italic,
		Image,
		HtmlEmbed,
		Table,
		TableToolbar,
		TableCellProperties,
		TableProperties,
		AdHocPlugin
	],
	toolbar: [
		'bold',
		'italic',
		'|',
		'insertTable',
		'htmlEmbed',
		'|',
		'ad-hoc-button',
		'|',
		'undo',
		'redo'
	],
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
		tableToolbar: [ 'bold', 'italic' ]
	}
};

ClassicEditor.create( document.querySelector( '#editor-classic' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

InlineEditor.create( document.querySelector( '#editor-inline' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

BalloonEditor.create( document.querySelector( '#editor-balloon' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const editorData = '<h2>Sample</h2>' +
	'<p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#document-editor">document editor build</a>.' +
	'</p>' +
	'<figure class="image">' +
		'<img src="./sample.jpg" alt="Autumn fields" />' +
	'</figure>' +
	'<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.' +
	'</p>';

DecoupledEditor.create( editorData, config )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
		document.querySelector( '.editable-container' ).appendChild( editor.ui.view.editable.element );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
