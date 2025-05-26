/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';

import EditorWatchdog from '../../src/editorwatchdog.js';

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

class MultiRootEditorIntegration {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		this.editor.on( 'addRoot', ( evt, root ) => {
			const domElement = this.editor.createEditable( root );

			const container = document.createElement( 'div' );
			container.className = 'editor';
			container.appendChild( domElement );

			document.getElementById( 'editors' ).appendChild( container );
		} );

		this.editor.on( 'detachRoot', ( evt, root ) => {
			const domElement = this.editor.detachEditable( root );

			domElement.parentElement.remove();
		} );
	}
}

const lazyRoots = [ 'lazyFoo', 'lazyBar' ];

const editorConfig = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet, TypingError, MultiRootEditorIntegration
	],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote',
		'insertTable', 'mediaEmbed', 'undo', 'redo' ],
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	lazyRoots
};

const watchdog = createWatchdog( document.getElementById( 'editor-state' ) );

Object.assign( window, { watchdog } );

document.getElementById( 'random-error' ).addEventListener( 'click', () => {
	throw new Error( 'foo' );
} );

let i = 0;

document.getElementById( 'add-root' ).addEventListener( 'click', () => {
	window.editor.addRoot( 'root' + ( ++i ), { data: '<p>' + i + '</p>' } );
} );

document.getElementById( 'remove-root' ).addEventListener( 'click', () => {
	const rootNames = window.editor.model.document.getRootNames();

	window.editor.detachRoot( rootNames[ rootNames.length - 1 ] );
} );

document.getElementById( 'load-root' ).addEventListener( 'click', () => {
	const rootName = lazyRoots.shift();

	window.editor.loadRoot( rootName, { data: '<p>' + rootName + '</p>' } );

	if ( lazyRoots.length == 0 ) {
		document.getElementById( 'load-root' ).remove();
	}
} );

function createWatchdog( stateElement ) {
	const watchdog = new EditorWatchdog( MultiRootEditor );

	watchdog.setCreator( ( elementsOrData, config ) => {
		return MultiRootEditor.create( elementsOrData, config ).then( editor => {
			window.editor = editor;

			const toolbarContainer = document.querySelector( '#toolbar' );
			toolbarContainer.innerHTML = '';
			toolbarContainer.appendChild( editor.ui.view.toolbar.element );

			return editor;
		} );
	} );

	watchdog.create(
		{
			header: document.querySelector( '#header' ),
			content: document.querySelector( '#content' )
		},
		editorConfig
	);

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
