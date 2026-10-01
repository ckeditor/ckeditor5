/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Table } from '../../src/table.js';
import { TableColumnResize } from '../../src/tablecolumnresize.js';

// The editor code runs in this (main) window, but the editable element lives in another document:
// either in a same-origin iframe or in a separate window opened with `window.open()`.
// The editor UI (toolbars, balloons) is not used at all - the integrator provides their own UI,
// which is emulated here by plain buttons in the main window.

const iframe = document.querySelector( '#editor-iframe' );
const modeButtons = document.querySelectorAll( '#mode button' );

let current = null;

for ( const button of modeButtons ) {
	button.addEventListener( 'click', () => attach( button.dataset.mode ) );
}

document.querySelector( '#get-data' ).addEventListener( 'click', () => current && log( current.editor.getData() ) );
document.querySelector( '#clear-log' ).addEventListener( 'click', () => {
	document.querySelector( '#log' ).textContent = '';
} );

window.addEventListener( 'error', evt => log( `Error (main window): ${ evt.message }` ) );
window.addEventListener( 'pagehide', () => current && current.mode == 'window' && current.targetWindow.close() );

attach( 'iframe' );

async function attach( mode ) {
	setModeButtonsDisabled( true );

	try {
		await detach();

		const targetWindow = mode == 'window' ?
			window.open( '', 'ckeditor5-multi-window', 'popup,width=1000,height=700' ) :
			iframe.contentWindow;

		if ( !targetWindow ) {
			log( 'The window could not be opened (blocked by the browser?).' );

			return;
		}

		iframe.hidden = mode != 'iframe';

		const targetDocument = targetWindow.document;

		targetDocument.open();
		targetDocument.write( getEditorDocumentHtml( mode ) );
		targetDocument.close();

		const styleObserver = mirrorStyles( targetDocument );
		const onError = evt => log( `Error (${ mode }): ${ evt.message }` );

		targetWindow.addEventListener( 'error', onError );

		const editor = await MultiRootEditor.create( { main: targetDocument.querySelector( '#editor' ) }, {
			plugins: [ Essentials, Paragraph, Heading, Bold, Italic, Table, TableColumnResize ]
		} );

		current = {
			mode,
			editor,
			targetWindow,
			cleanup() {
				styleObserver.disconnect();
				targetWindow.removeEventListener( 'error', onError );
			}
		};

		window.editor = editor;

		if ( mode == 'window' ) {
			// The user closed the window - the editable element is gone, so destroy the editor too.
			targetWindow.addEventListener( 'pagehide', () => {
				if ( current && current.editor == editor ) {
					log( 'The editor window was closed.' );
					detach();
				}
			} );
		}

		createCommandButtons( editor );
		bindStatus( editor );
		bindLog( editor );

		log( `Editor attached to: ${ mode }` );
	} catch ( err ) {
		log( 'Editor initialization failed: ' + err.stack );
		console.error( err.stack );
	} finally {
		setModeButtonsDisabled( false );
	}
}

async function detach() {
	if ( !current ) {
		return;
	}

	const { mode, editor, targetWindow, cleanup } = current;

	current = null;
	window.editor = null;

	cleanup();
	document.querySelector( '#commands' ).replaceChildren();

	await editor.destroy();

	if ( mode == 'window' && !targetWindow.closed ) {
		targetWindow.close();
	}
}

function createCommandButtons( editor ) {
	const container = document.querySelector( '#commands' );
	const commands = [
		[ 'insertTable', { rows: 3, columns: 3 } ],
		[ 'insertTableRowAbove' ],
		[ 'insertTableRowBelow' ],
		[ 'insertTableColumnLeft' ],
		[ 'insertTableColumnRight' ],
		[ 'removeTableRow' ],
		[ 'removeTableColumn' ],
		[ 'setTableRowHeader' ],
		[ 'setTableColumnHeader' ],
		[ 'mergeTableCells' ],
		[ 'splitTableCellVertically' ],
		[ 'splitTableCellHorizontally' ],
		[ 'selectTableRow' ],
		[ 'selectTableColumn' ],
		[ 'undo' ],
		[ 'redo' ]
	];

	for ( const [ commandName, options ] of commands ) {
		const command = editor.commands.get( commandName );
		const button = document.createElement( 'button' );

		button.textContent = commandName;
		button.disabled = !command.isEnabled;

		command.on( 'change:isEnabled', () => {
			button.disabled = !command.isEnabled;
		} );

		// Keep the focus (and the DOM selection) in the editor document.
		button.addEventListener( 'mousedown', evt => evt.preventDefault() );

		button.addEventListener( 'click', () => {
			editor.execute( commandName, options );
			editor.editing.view.focus();
			log( `Executed: ${ commandName }` );
		} );

		container.appendChild( button );
	}
}

function bindStatus( editor ) {
	const focusedElement = document.querySelector( '#status-focused' );
	const selectionElement = document.querySelector( '#status-selection' );
	const cellsElement = document.querySelector( '#status-cells' );
	const tableSelection = editor.plugins.get( 'TableSelection' );

	const update = () => {
		const selection = editor.model.document.selection;
		const range = selection.getFirstRange();
		const selectedCells = tableSelection.getSelectedTableCells();

		focusedElement.textContent = String( editor.editing.view.document.isFocused );
		selectionElement.textContent = range ?
			`[${ range.start.path }] - [${ range.end.path }] (ranges: ${ selection.rangeCount })` :
			'-';
		cellsElement.textContent = selectedCells ? String( selectedCells.length ) : '-';
	};

	editor.editing.view.document.on( 'change:isFocused', update );
	editor.model.document.selection.on( 'change', update );

	update();
}

function bindLog( editor ) {
	const viewDocument = editor.editing.view.document;

	for ( const eventName of [ 'dragstart', 'dragend', 'drop', 'clipboardInput' ] ) {
		viewDocument.on( eventName, () => log( `View document event: ${ eventName }` ) );
	}

	editor.model.document.on( 'change:data', ( evt, batch ) => {
		const operationTypes = batch.operations.map( operation => operation.type );

		log( `Data changed (batch operations: ${ operationTypes.join( ', ' ) })` );
	} );
}

// The editor content styles are injected into the main document only, so copy them to the editor document
// and keep copying the ones added later on.
function mirrorStyles( targetDocument ) {
	const isStyleNode = node => node.nodeName == 'STYLE' || ( node.nodeName == 'LINK' && node.rel == 'stylesheet' );
	const copyNode = node => targetDocument.head.appendChild( targetDocument.importNode( node, true ) );

	Array.from( document.head.childNodes ).filter( isStyleNode ).forEach( copyNode );

	const observer = new MutationObserver( mutations => {
		for ( const mutation of mutations ) {
			Array.from( mutation.addedNodes ).filter( isStyleNode ).forEach( copyNode );
		}
	} );

	observer.observe( document.head, { childList: true } );

	return observer;
}

function setModeButtonsDisabled( isDisabled ) {
	for ( const button of modeButtons ) {
		button.disabled = isDisabled;
	}
}

function log( message ) {
	const logElement = document.querySelector( '#log' );

	logElement.textContent += message + '\n';
	logElement.scrollTop = logElement.scrollHeight;
}

function getEditorDocumentHtml( mode ) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Editor ${ mode }</title>
	<style>
		body { margin: 0; padding: 20px; font-family: sans-serif; }
		#editor { min-height: 400px; padding: 0 1em; outline: 1px solid hsl( 0, 0%, 80% ); }
	</style>
</head>
<body>
	<div id="editor">
		<h2>Editor inside ${ mode == 'window' ? 'a separate window' : 'an iframe' }, code in the main window</h2>
		<p>Paragraph before the table. <strong>Drag</strong> this text into a table cell.</p>
		<figure class="table" style="width:600px;">
			<table>
				<colgroup>
					<col style="width:30%;">
					<col style="width:40%;">
					<col style="width:30%;">
				</colgroup>
				<thead>
					<tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr>
				</thead>
				<tbody>
					<tr><td>11</td><td>12</td><td>13</td></tr>
					<tr><td>21</td><td>22</td><td>23</td></tr>
					<tr><td>31</td><td>32</td><td>33</td></tr>
				</tbody>
			</table>
		</figure>
		<p>Paragraph between the tables.</p>
		<figure class="table">
			<table>
				<tbody>
					<tr><td>a1</td><td>a2</td></tr>
					<tr><td>b1</td><td>b2</td></tr>
				</tbody>
			</table>
		</figure>
		<p>Paragraph after the tables.</p>
	</div>
</body>
</html>`;
}
