/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { ActionsRecorder } from '@ckeditor/ckeditor5-watchdog';

declare global {
	interface Window { editor: any }
}

class TypingError {
	declare public editor: any;

	constructor( editor: any ) {
		this.editor = editor;
	}

	public init() {
		const inputCommand = this.editor.commands.get( 'insertText' );

		inputCommand.on( 'execute', ( evt: any, data: any ) => {
			const commandArgs = data[ 0 ];

			if ( commandArgs.text === '1' ) {
				// Simulate error.
				this.editor.foo.bar = 'bom';
			}
		} );
	}
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
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
