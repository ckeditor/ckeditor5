/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import EditorWatchdog from '../../src/editorwatchdog';

class TypingError {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const inputCommand = this.editor.commands.get( 'input' );

		inputCommand.on( 'execute', ( evt, data ) => {
			const commandArgs = data[ 0 ];

			if ( commandArgs.text === '1' ) {
				// Simulate error.
				this.editor.foo.bar = 'bom';
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

const watchdog1 = createWatchdog(
	document.getElementById( 'editor-1' ),
	document.getElementById( 'editor-1-state' ),
	'First'
);

const watchdog2 = createWatchdog(
	document.getElementById( 'editor-2' ),
	document.getElementById( 'editor-2-state' ),
	'Second'
);

Object.assign( window, { watchdog1, watchdog2 } );

document.getElementById( 'random-error' ).addEventListener( 'click', () => {
	throw new Error( 'foo' );
} );

function createWatchdog( editorElement, stateElement, name ) {
	const watchdog = new EditorWatchdog( ClassicEditor );

	watchdog.create( editorElement, editorConfig );

	watchdog.on( 'error', () => {
		console.log( `${ name } editor crashed!` );
	} );

	watchdog.on( 'restart', () => {
		console.log( `${ name } editor restarted.` );
	} );

	watchdog.on( 'stateChange', () => {
		console.log( `${ name } watchdog state changed to '${ watchdog.state }'` );

		stateElement.innerText = watchdog.state;

		if ( watchdog.state === 'crashedPermanently' ) {
			watchdog.editor.isReadOnly = true;
		}
	} );

	stateElement.innerText = watchdog.state;

	return watchdog;
}
