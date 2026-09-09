/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { ImageResize } from '@ckeditor/ckeditor5-image';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';

import { createEditorDomRoot, getOverlayConfig, wrapInShadowRoot } from './_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

const addRootButton = document.querySelector( '#add-root' )! as HTMLButtonElement;
const detachRootButton = document.querySelector( '#detach-root' )! as HTMLButtonElement;
const rootListLabel = document.querySelector( '#root-list' )!;

// The outermost host wrapping each root's editable, so detaching a root can take its whole tree out of the DOM –
// not just the editable inside it. Without removing the host, its root would linger and stay registered.
const rootHosts = new Map<string, HTMLElement>();

let editor: MultiRootEditor;
let rootsContainer: HTMLElement;
let addedRootCount = 0;

/**
 * Wraps `element` in `levels` nested shadow roots and returns the outermost host, which is what has to be inserted
 * into (and later removed from) the surrounding DOM in place of the original element.
 *
 * In the light DOM there is nothing to nest, so `element` is returned untouched and the rest of the test works the
 * same way – which is what makes the light DOM a fair comparison rather than a different code path.
 */
function nestInShadowRoots( element: HTMLElement, levels: number ): HTMLElement {
	let current = element;

	for ( let i = 0; i < levels; i++ ) {
		const shadowRoot = wrapInShadowRoot( current );

		if ( !shadowRoot ) {
			break;
		}

		current = shadowRoot.host as HTMLElement;
	}

	return current;
}

/**
 * Puts a root's editable into a root of its own, appended to the shared roots container.
 */
function mountRootEditable( rootName: string, editableElement: HTMLElement ): void {
	const host = nestInShadowRoots( editableElement, 1 );

	// Set here rather than in the page stylesheet: this host lives inside the editor root, out of reach of any CSS
	// in the main document. The frame makes it obvious where one root ends and the next begins, which is the whole
	// point of the add/detach buttons.
	Object.assign( host.style, {
		display: 'block',
		border: '1px solid #c4c4c4'
	} );

	rootsContainer.appendChild( host );
	rootHosts.set( rootName, host );

	updateRootListLabel();
}

function createMountedRootElement( rootName: string ): HTMLElement {
	const editableElement = document.createElement( 'div' );

	mountRootEditable( rootName, editableElement );

	return editableElement;
}

function unmountRootEditable( rootName: string ): void {
	const host = rootHosts.get( rootName );

	if ( host ) {
		host.remove();
		rootHosts.delete( rootName );
	}

	updateRootListLabel();
}

function updateRootListLabel(): void {
	const names = Array.from( rootHosts.keys() );

	rootListLabel.textContent = names.length ? names.join( ', ' ) : '—';
	detachRootButton.disabled = names.length < 2;
}

async function init(): Promise<void> {
	const editorDomRoot = createEditorDomRoot( document.querySelector( '#editor-component-slot' )! );

	const menuBarContainer = document.createElement( 'div' );
	const toolbarContainer = document.createElement( 'div' );

	rootsContainer = document.createElement( 'div' );

	Object.assign( rootsContainer.style, {
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5em',
		marginTop: '1.5em'
	} );

	editorDomRoot.append( menuBarContainer, toolbarContainer, rootsContainer );

	editor = await MultiRootEditor.create( {
		roots: {
			main: {
				element: createMountedRootElement( 'main' ),
				initialData: document.querySelector( '#editor-data' )!.innerHTML
			},
			second: {
				element: createMountedRootElement( 'second' ),
				initialData: document.querySelector( '#secondary-editor-data' )!.innerHTML
			}
		},
		plugins: [
			ArticlePluginSet,
			BlockToolbar, BalloonToolbar,
			FontColor, FontBackgroundColor,
			ImageResize, TableProperties, TableCellProperties,
			FindAndReplace
		],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'link', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		blockToolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		image: {
			toolbar: [ 'imageTextAlternative', 'toggleImageCaption', '|', 'resizeImage' ]
		},
		menuBar: {
			isVisible: true
		},
		...getOverlayConfig()
	} );

	window.editor = editor;

	editor.on( 'addRoot', ( evt, root ) => {
		if ( rootHosts.has( root.rootName ) ) {
			return;
		}

		editor.createEditable( root, { element: createMountedRootElement( root.rootName ) } );
	} );

	editor.on( 'detachRoot', ( evt, root ) => {
		editor.detachEditable( root );
		unmountRootEditable( root.rootName );
	} );

	// `MultiRootEditor` leaves placement of the toolbar and the menu bar to the integrator, so this test places
	// them itself and then pushes each of them two more levels deeper than the editor root.
	toolbarContainer.appendChild( editor.ui.view.toolbar!.element! );
	nestInShadowRoots( editor.ui.view.toolbar!.element!, 2 );

	if ( editor.ui.view.menuBarView ) {
		menuBarContainer.appendChild( editor.ui.view.menuBarView.element! );
		nestInShadowRoots( editor.ui.view.menuBarView.element!, 2 );
	}

	editor.ui.update();
}

addRootButton.addEventListener( 'click', () => {
	addedRootCount++;

	editor.addRoot( `added${ addedRootCount }`, {
		initialData: `<h3>Root added${ addedRootCount }</h3><p>Added at runtime, in a brand new root.</p>`
	} );
} );

detachRootButton.addEventListener( 'click', () => {
	const rootNames = Array.from( rootHosts.keys() );
	const lastRootName = rootNames[ rootNames.length - 1 ];

	if ( lastRootName ) {
		editor.detachRoot( lastRootName );
	}
} );

init().catch( err => console.error( err.stack ) );
