/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Command, Editor } from 'ckeditor5/src/core.js';

import {
	LiveRange,
	type DocumentChangeEvent,
	type Item,
	type Text
} from 'ckeditor5/src/engine.js';

import { first } from 'ckeditor5/src/utils.js';

import type Autoformat from './autoformat.js';

import type { Delete } from 'ckeditor5/src/typing.js';

/**
 * The block autoformatting engine. It allows to format various block patterns. For example,
 * it can be configured to turn a paragraph starting with `*` and followed by a space into a list item.
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the {@link module:autoformat/blockautoformatediting~blockAutoformatEditing `blockAutoformatEditing`} documentation
 * to learn how to create custom block autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 *
 * @module autoformat/blockautoformatediting
 */

/**
 * Creates a listener triggered on {@link module:engine/model/document~Document#event:change:data `change:data`} event in the document.
 * Calls the callback when inserted text matches the regular expression or the command name
 * if provided instead of the callback.
 *
 * Examples of usage:
 *
 * To convert a paragraph into heading 1 when `- ` is typed, using just the command name:
 *
 * ```ts
 * blockAutoformatEditing( editor, plugin, /^\- $/, 'heading1' );
 * ```
 *
 * To convert a paragraph into heading 1 when `- ` is typed, using just the callback:
 *
 * ```ts
 * blockAutoformatEditing( editor, plugin, /^\- $/, ( context ) => {
 * 	const { match } = context;
 * 	const headingLevel = match[ 1 ].length;
 *
 * 	editor.execute( 'heading', {
 * 		formatId: `heading${ headingLevel }`
 * 	} );
 * } );
 * ```
 *
 * @param editor The editor instance.
 * @param plugin The autoformat plugin instance.
 * @param pattern The regular expression to execute on just inserted text. The regular expression is tested against the text
 * from the beginning until the caret position.
 * @param callbackOrCommand The callback to execute or the command to run when the text is matched.
 * In case of providing the callback, it receives the following parameter:
 * * match RegExp.exec() result of matching the pattern to inserted text.
 */
export default function blockAutoformatEditing(
	editor: Editor,
	plugin: Autoformat,
	pattern: RegExp,
	callbackOrCommand: string | ( ( context: { match: RegExpExecArray } ) => unknown )
): void {
	let callback: ( context: { match: RegExpExecArray } ) => unknown;
	let command: Command | null = null;

	if ( typeof callbackOrCommand == 'function' ) {
		callback = callbackOrCommand;
	} else {
		// We assume that the actual command name was provided.
		command = editor.commands.get( callbackOrCommand )!;

		callback = () => {
			editor.execute( callbackOrCommand );
		};
	}

	editor.model.document.on<DocumentChangeEvent>( 'change:data', ( evt, batch ) => {
		if ( command && !command.isEnabled || !plugin.isEnabled ) {
			return;
		}

		const range = first( editor.model.document.selection.getRanges() )!;

		if ( !range.isCollapsed ) {
			return;
		}

		if ( batch.isUndo || !batch.isLocal ) {
			return;
		}

		const changes = Array.from( editor.model.document.differ.getChanges() );
		const entry = changes[ 0 ];

		// Typing is represented by only a single change.
		if ( changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1 ) {
			return;
		}

		const blockToFormat = entry.position.parent;

		// Block formatting should be disabled in codeBlocks (#5800).
		if ( blockToFormat.is( 'element', 'codeBlock' ) ) {
			return;
		}

		// Only list commands and custom callbacks can be applied inside a list.
		if ( blockToFormat.is( 'element', 'listItem' ) &&
			typeof callbackOrCommand !== 'function' &&
			![ 'numberedList', 'bulletedList', 'todoList' ].includes( callbackOrCommand )
		) {
			return;
		}

		// In case a command is bound, do not re-execute it over an existing block style which would result in a style removal.
		// Instead, just drop processing so that autoformat trigger text is not lost. E.g. writing "# " in a level 1 heading.
		if ( command && command.value === true ) {
			return;
		}

		const firstNode = blockToFormat.getChild( 0 ) as Text;

		const firstNodeRange = editor.model.createRangeOn( firstNode );

		// Range is only expected to be within or at the very end of the first text node.
		if ( !firstNodeRange.containsRange( range ) && !range.end.isEqual( firstNodeRange.end ) ) {
			return;
		}

		const match = pattern.exec( firstNode.data.substr( 0, range.end.offset ) );

		// ...and this text node's data match the pattern.
		if ( !match ) {
			return;
		}

		// Use enqueueChange to create new batch to separate typing batch from the auto-format changes.
		editor.model.enqueueChange( writer => {
			// Matched range.
			const start = writer.createPositionAt( blockToFormat, 0 );
			const end = writer.createPositionAt( blockToFormat, match[ 0 ].length );
			const range = new LiveRange( start, end );

			const wasChanged = callback( { match } );

			// Remove matched text.
			if ( wasChanged !== false ) {
				writer.remove( range );

				const selectionRange = editor.model.document.selection.getFirstRange()!;
				const blockRange = writer.createRangeIn( blockToFormat );

				// If the block is empty and the document selection has been moved when
				// applying formatting (e.g. is now in newly created block).
				if ( blockToFormat.isEmpty && !blockRange.isEqual( selectionRange ) && !blockRange.containsRange( selectionRange, true ) ) {
					writer.remove( blockToFormat as Item );
				}
			}
			range.detach();

			editor.model.enqueueChange( () => {
				const deletePlugin: Delete = editor.plugins.get( 'Delete' );

				deletePlugin.requestUndoOnBackspace();
			} );
		} );
	} );
}
