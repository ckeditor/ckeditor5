/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { List } from '@ckeditor/ckeditor5-list';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { Plugin } from '../src/plugin.js';
import { onEditorError } from '../src/errorreporter.js';
import type { EditorConfig } from '../src/editor/editorconfig.js';

/**
 * Throws for real, from a plugin, with the plugin as the error context. This is the shape almost every
 * error in the codebase has, and the shape attribution has to resolve.
 */
class ErrorSimulator extends Plugin {
	public static get pluginName() {
		return 'ErrorSimulator' as const;
	}

	public throwFromPlugin(): void {
		throw new CKEditorError( 'simulated-plugin-error', this );
	}

	/**
	 * `null` says the error is not actionable per editor, so reporting leaves it alone. It must still reach
	 * the console — the point of the case is that nothing is swallowed.
	 */
	public throwWithoutAttribution(): void {
		throw new CKEditorError( 'simulated-unattributed-error', null );
	}

	public throwPlainError(): void {
		throw new TypeError( 'A plain error, not a CKEditorError.' );
	}
}

const log = document.querySelector( '#log' ) as HTMLOListElement;

function logReport( errorName: string, sourceName: string ): void {
	const entry = document.createElement( 'li' );

	entry.textContent = `${ new Date().toLocaleTimeString() } · ${ errorName } · attributed to: ${ sourceName }`;

	log.append( entry );
}

document.querySelector( '#clear-log' )!.addEventListener( 'click', () => {
	log.innerHTML = '';
} );

/**
 * Each editor gets its own array, spelled out at the call site. Handing the same array to two editors would
 * make them share an object, which is enough to confuse attribution on its own — and this page is meant to
 * show that happening for one specific reason only: the list feature, loaded by editors 1 and 3.
 */
function createEditor( selector: string, plugins: EditorConfig[ 'plugins' ] ): Promise<ClassicEditor> {
	return ClassicEditor.create( {
		attachTo: document.querySelector( selector ) as HTMLElement,
		plugins,
		toolbar: [ 'bold', '|', 'undo', 'redo' ]
	} );
}

Promise.all( [
	// Editors 1 and 3 both load the list feature on purpose. That is what gives them an object in common,
	// and it takes two of them — a feature loaded by a single editor shares nothing with anyone.
	createEditor( '#editor-1', [ Essentials, Paragraph, Bold, ErrorSimulator, List ] ),
	createEditor( '#editor-2', [ Essentials, Paragraph, Bold, ErrorSimulator ] ),
	createEditor( '#editor-3', [ Essentials, Paragraph, Bold, ErrorSimulator, List ] )
] )
	.then( ( [ first, second, third ] ) => {
		const names = new Map( [
			[ first, 'editor 1' ],
			[ second, 'editor 2' ],
			[ third, 'editor 3' ]
		] );

		// One registration for the whole page. Which editor an error belongs to is decided by comparing
		// `source` with the instances this page holds — there is no per-editor registration.
		onEditorError( ( { error, source } ) => {
			// Only the first line, because the message also carries the link to the error documentation.
			logReport( error.message.split( '\n' )[ 0 ], names.get( source as ClassicEditor ) ?? 'something else' );
		} );

		// Thrown from a timeout so that the error escapes as an uncaught one, the way it would in
		// production. Throwing straight from the click handler would be caught by the browser as a listener
		// error, which is a different path.
		function onClick( selector: string, action: () => void ): void {
			document.querySelector( selector )!.addEventListener( 'click', () => {
				setTimeout( action );
			} );
		}

		onClick( '#throw-1', () => first.plugins.get( ErrorSimulator ).throwFromPlugin() );
		onClick( '#throw-2', () => second.plugins.get( ErrorSimulator ).throwFromPlugin() );
		onClick( '#throw-3', () => third.plugins.get( ErrorSimulator ).throwFromPlugin() );
		onClick( '#throw-unattributed', () => first.plugins.get( ErrorSimulator ).throwWithoutAttribution() );
		onClick( '#throw-plain', () => first.plugins.get( ErrorSimulator ).throwPlainError() );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
