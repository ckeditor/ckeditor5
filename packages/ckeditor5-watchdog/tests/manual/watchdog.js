/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Watchdog from '@ckeditor/ckeditor5-watchdog/src/watchdog';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

const firstEditorElement = document.getElementById( 'editor-1' );
const secondEditorElement = document.getElementById( 'editor-2' );

const restartButton = document.getElementById( 'restart' );
const firstEditorErrorButton = document.getElementById( 'error-1' );
const secondEditorErrorButton = document.getElementById( 'error-2' );
const randomErrorButton = document.getElementById( 'random-error' );

const editorConfig = {
	plugins: [
		ArticlePluginSet,
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote',
		'insertTable', 'mediaEmbed', 'undo', 'redo' ],
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	}
};

// Watchdog 1

const watchdog1 = Watchdog.for( ClassicEditor );

watchdog1.create( firstEditorElement, editorConfig ).then( () => {
	console.log( 'First editor created.' );

	firstEditorErrorButton.addEventListener( 'click', () => {
		throw new CKEditorError( 'Crash on the first editor model document', watchdog1.editor.model.document );
	} );
} );

watchdog1.on( 'crash', () => {
	console.log( 'First editor crashed!' );
} );

watchdog1.on( 'restart', () => {
	console.log( 'First editor restarted.' );
} );

// Watchdog 2

const watchdog2 = Watchdog.for( ClassicEditor );

watchdog2.create( secondEditorElement, editorConfig ).then( () => {
	console.log( 'Second editor created.' );

	secondEditorErrorButton.addEventListener( 'click', () => {
		throw new CKEditorError( 'Crash on the second editor model document', watchdog2.editor.model.document );
	} );
} );

watchdog2.on( 'crash', () => {
	console.log( 'Second editor crashed!' );
} );

watchdog2.on( 'restart', () => {
	console.log( 'Second editor restarted.' );
} );

restartButton.addEventListener( 'click', () => {
	watchdog1.restart();
	watchdog2.restart();
} );

randomErrorButton.addEventListener( 'click', () => {
	throw new Error( 'foo' );
} );
