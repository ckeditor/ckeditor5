/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, window */

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

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
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
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

const watchdog = createWatchdog( document.getElementById( 'editor-state' ) );

Object.assign( window, { watchdog } );

document.getElementById( 'random-error' ).addEventListener( 'click', () => {
	throw new Error( 'foo' );
} );

function createWatchdog( stateElement ) {
	const watchdog = new EditorWatchdog( MultiRootEditor );

	watchdog
		.create(
			{
				header: document.querySelector( '#header' ),
				content: document.querySelector( '#content' )
			},
			editorConfig
		)
		.then( () => {
			const toolbarContainer = document.querySelector( '#toolbar' );
			toolbarContainer.appendChild( watchdog.editor.ui.view.toolbar.element );
		} );

	watchdog.on( 'error', () => {
		console.log( 'Editor crashed!' );
	} );

	watchdog.on( 'restart', () => {
		console.log( 'Editor restarted.' );
	} );

	watchdog.on( 'stateChange', () => {
		console.log( `Watchdog state changed to '${ watchdog.state }'` );

		stateElement.innerText = watchdog.state;

		if ( watchdog.state === 'crashedPermanently' ) {
			watchdog.editor.enableReadOnlyMode( 'manual-test' );
		}
	} );

	stateElement.innerText = watchdog.state;

	return watchdog;
}
