/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { Context } from '../src/context.js';
import { ContextPlugin } from '../src/contextplugin.js';
import { Plugin } from '../src/plugin.js';
import { onEditorError } from '../src/errorreporter.js';
import type { EditorConfig } from '../src/editor/editorconfig.js';

/**
 * Throws with itself as the error context, from a plugin that belongs to one editor.
 */
class EditorErrorSimulator extends Plugin {
	public static get pluginName() {
		return 'EditorErrorSimulator' as const;
	}

	public throwFromPlugin(): void {
		throw new CKEditorError( 'simulated-editor-plugin-error', this );
	}
}

/**
 * Throws with itself as the error context, from a plugin shared by every editor in the context.
 */
class ContextErrorSimulator extends ContextPlugin {
	public static get pluginName() {
		return 'ContextErrorSimulator' as const;
	}

	public throwFromContextPlugin(): void {
		throw new CKEditorError( 'simulated-context-plugin-error', this );
	}

	/**
	 * The context itself is one of the two things reporting can name, so it is worth being able to throw
	 * with it directly.
	 */
	public throwFromContext(): void {
		throw new CKEditorError( 'simulated-context-error', this.context );
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

function createEditor( selector: string, context: Context ): Promise<ClassicEditor> {
	return ClassicEditor.create( {
		attachTo: document.querySelector( selector ) as HTMLElement,
		context,
		plugins: [ Essentials, Paragraph, Bold, EditorErrorSimulator ],
		toolbar: [ 'bold', '|', 'undo', 'redo' ]
	} as EditorConfig );
}

Context
	.create( { plugins: [ ContextErrorSimulator ] } )
	.then( async context => {
		const first = await createEditor( '#editor-1', context );
		const second = await createEditor( '#editor-2', context );

		const names = new Map<unknown, string>( [
			[ context, 'the context' ],
			[ first, 'editor 1' ],
			[ second, 'editor 2' ]
		] );

		onEditorError( ( { error, source } ) => {
			// Only the first line, because the message also carries the link to the error documentation.
			logReport( error.message.split( '\n' )[ 0 ], names.get( source ) ?? 'something else' );
		} );

		// Thrown from a timeout so that the error escapes as an uncaught one, the way it would in
		// production. Throwing straight from the click handler would be caught by the browser as a listener
		// error, which is a different path.
		function onClick( selector: string, action: () => void ): void {
			document.querySelector( selector )!.addEventListener( 'click', () => {
				setTimeout( action );
			} );
		}

		const contextSimulator = context.plugins.get( ContextErrorSimulator );

		onClick( '#throw-1', () => first.plugins.get( EditorErrorSimulator ).throwFromPlugin() );
		onClick( '#throw-2', () => second.plugins.get( EditorErrorSimulator ).throwFromPlugin() );
		onClick( '#throw-context', () => contextSimulator.throwFromContext() );
		onClick( '#throw-context-plugin', () => contextSimulator.throwFromContextPlugin() );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
