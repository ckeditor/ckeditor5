/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import Watchdog from '../../src/watchdog';

const firstEditorElement = document.getElementById( 'editor-1' );
const secondEditorElement = document.getElementById( 'editor-2' );

const restartButton = document.getElementById( 'restart' );
const randomErrorButton = document.getElementById( 'random-error' );

class TypingError {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const inputCommand = this.editor.commands.get( 'input' );

		inputCommand.on( 'execute', ( evt, data ) => {
			const commandArgs = data[ 0 ];

			if ( commandArgs.text === '1' ) {
				throw new CKEditorError( 'Fake error - input command executed with value `1`', this );
			}
		} );
	}
}

const editorConfig = {
	plugins: [
		ArticlePluginSet, TypingError
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
window.watchdog1 = watchdog1;

watchdog1.create( firstEditorElement, editorConfig ).then( () => {
	console.log( 'First editor created.' );
} );

watchdog1.on( 'error', () => {
	console.log( 'First editor crashed!' );
} );

watchdog1.on( 'restart', () => {
	console.log( 'First editor restarted.' );
} );

// Watchdog 2

const watchdog2 = Watchdog.for( ClassicEditor );
window.watchdog2 = watchdog2;

watchdog2.create( secondEditorElement, editorConfig ).then( () => {
	console.log( 'Second editor created.' );
} );

watchdog2.on( 'error', () => {
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
