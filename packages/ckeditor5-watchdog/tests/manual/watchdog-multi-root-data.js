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
			this.addRoot( root );
		} );

		this.editor.on( 'detachRoot', ( evt, root ) => {
			this.detachRoot( root );
		} );
	}

	addRoot( root ) {
		const domElement = this.editor.createEditable( root );

		this.attachEditable( domElement );
	}

	attachEditable( domElement ) {
		const container = document.createElement( 'div' );
		container.className = 'editor';
		container.appendChild( domElement );

		document.getElementById( 'editors' ).appendChild( container );
	}

	detachRoot( root ) {
		const domElement = this.editor.detachEditable( root );

		domElement.parentElement.remove();
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

			document.querySelector( '#toolbar' ).appendChild( editor.ui.view.toolbar.element );

			const multiRootEditorIntegration = editor.plugins.get( MultiRootEditorIntegration );

			for ( const name of editor.ui.getEditableElementsNames() ) {
				const editable = editor.ui.getEditableElement( name );

				multiRootEditorIntegration.attachEditable( editable );
			}

			return editor;
		} );
	} );

	watchdog.setDestructor( editor => {
		document.querySelector( '#toolbar' ).innerHTML = '';
		document.querySelector( '#editors' ).innerHTML = '';

		return editor.destroy();
	} );

	watchdog.create(
		{
			header: '<h2>Gone traveling</h2><h3>Monthly travel news and inspiration</h3>',
			content: '<h3>Destination of the Month</h3>' +
				'<h4>Valletta</h4>' +
				'<p>' +
					'The capital city of <a href="https://en.wikipedia.org/wiki/Malta" target="_blank" rel="external">Malta</a> ' +
					'is the top destination this summer. It’s home to cutting-edge contemporary architecture, baroque masterpieces, ' +
					'delicious local cuisine, and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take ' +
					'a tour through locations familiar to you from Game of Thrones, Gladiator, Troy, and many more.' +
				'</p>'
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
