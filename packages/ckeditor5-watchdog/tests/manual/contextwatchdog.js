/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Context, ContextPlugin } from '@ckeditor/ckeditor5-core';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { ContextWatchdog } from '../../src/contextwatchdog.js';

const stateElement = document.getElementById( 'context-state' );

class ContextErrorPlugin extends ContextPlugin {
	init() {
		window.contextErrorPlugin = this;
	}

	throwError() {
		setTimeout( () => {
			throw new CKEditorError( 'context-error', this.context );
		} );
	}
}

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

const watchdog = new ContextWatchdog( Context );

window.watchdog = watchdog;

const contextConfig = {
	plugins: [ ContextErrorPlugin ]
};

watchdog.create( contextConfig )
	.then( () => {
		return Promise.all( [
			watchdog.add( {
				id: 'editor1',
				type: 'editor',
				creator: async ( element, config ) => {
					const editor1 = await ClassicEditor.create( element, config );

					window.editor1 = editor1;
					console.log( 'Created editor1!', editor1 );

					return editor1;
				},
				sourceElementOrData: document.getElementById( 'editor-1' ),
				config: {
					plugins: [ ArticlePluginSet, TypingError ],
					image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
				}
			} ),
			watchdog.add( {
				id: 'editor2',
				type: 'editor',
				creator: async ( element, config ) => {
					const editor2 = await ClassicEditor.create( element, config );

					window.editor2 = editor2;
					console.log( 'Created editor2!', editor2 );

					return editor2;
				},
				sourceElementOrData: document.getElementById( 'editor-2' ),
				config: {
					plugins: [ ArticlePluginSet, TypingError ],
					image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
				}
			} )
		] );
	} );

watchdog.on( 'itemError', ( evt, { itemId, error } ) => {
	console.log( `Context watchdog item (${ itemId }) error:`, error );
} );

watchdog.on( 'error', ( evt, { error } ) => {
	console.log( 'Context watchdog error:', error );
} );

watchdog.on( 'restart', () => {
	console.log( 'Context watchdog restarted.' );
} );

watchdog.on( 'stateChange', () => {
	console.log( `Context watchdog state changed to '${ watchdog.state }'` );

	stateElement.innerText = watchdog.state;
} );

stateElement.innerText = watchdog.state;

document.getElementById( 'context-error' ).addEventListener( 'click', () => {
	if ( window.contextErrorPlugin ) {
		window.contextErrorPlugin.throwError();
	}
} );

document.getElementById( 'random-error' ).addEventListener( 'click', () => {
	throw new Error( 'foo' );
} );
