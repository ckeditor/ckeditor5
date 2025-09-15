/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ActionsRecorder } from '@ckeditor/ckeditor5-watchdog';

class TypingError {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const inputCommand = this.editor.commands.get( 'insertText' );

		inputCommand.on( 'execute', ( evt, data ) => {
			const commandArgs = data[ 0 ];

			if ( commandArgs.text === '1' ) {
				// Simulate error.
				this.editor.foo.bar = 'bom';
			}
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, ActionsRecorder, TypingError ],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		actionsRecorder: {
			maxEntries: 50,

			// onFilter( entry ) {
			// 	// Only record command executions.
			// 	return entry.action.startsWith( 'commands.' );
			// },

			onMaxEntries() {
				const entries = this.getEntries();

				this.flushEntries();

				console.log( 'ActionsRecorder - Batch of entries:', entries );
			},

			onError( error, entries ) {
				console.error( 'ActionsRecorder - Error detected:', error );
				console.warn( 'Actions recorded before error:', entries );

				this.flushEntries();
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
