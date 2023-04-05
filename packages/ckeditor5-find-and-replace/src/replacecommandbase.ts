/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/replacecommandbase
*/

import { Command, type Editor } from 'ckeditor5/src/core';
import type { ResultType } from './findandreplace';
import type FindAndReplaceState from './findandreplacestate';

export abstract class ReplaceCommandBase extends Command {
	/**
	 * The find and replace state object used for command operations.
	 */
	protected _state: FindAndReplaceState;

	/**
	 * Creates a new `ReplaceCommand` instance.
	 *
	 * @param editor Editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */
	constructor( editor: Editor, state: FindAndReplaceState ) {
		super( editor );

		// The replace command is always enabled.
		this.isEnabled = true;

		this._state = state;
	}

	public abstract override execute( ...args: Array<unknown> ): void;

	/**
	 * Common logic for both `replace` commands.
	 * Replace a given find result by a string or a callback.
	 *
	 * @param result A single result from the find command.
	 */
	protected _replace( replacementText: string, result: ResultType ): void {
		const { model } = this.editor;

		model.change( writer => {
			const range = result.marker!.getRange();

			// Don't replace a result (marker) that found its way into the $graveyard (e.g. removed by collaborators).
			if ( range.root.rootName === '$graveyard' ) {
				this._state.results.remove( result );

				return;
			}

			let textAttributes = {};

			for ( const item of range.getItems() ) {
				if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
					textAttributes = item.getAttributes();
					break;
				}
			}

			model.insertContent( writer.createText( replacementText, textAttributes ), range );

			if ( this._state.results.has( result ) ) {
				this._state.results.remove( result );
			}
		} );
	}
}
