/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findnextcommand
*/

import { Command, type Editor } from 'ckeditor5/src/core';
import type FindAndReplaceState from './findandreplacestate';

/**
 * The find next command. Moves the highlight to the next search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export default class FindNextCommand extends Command {
	/**
	 * The find and replace state object used for command operations.
	 */
	protected _state: FindAndReplaceState;

	/**
	 * Creates a new `FindNextCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */
	constructor( editor: Editor, state: FindAndReplaceState ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this._state = state;

		this.isEnabled = false;

		this.listenTo( this._state.results, 'change', () => {
			this.isEnabled = this._state.results.length > 1;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._state.results.length > 1;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const results = this._state.results;
		const currentIndex = results.getIndex( this._state.highlightedResult! );
		const nextIndex = currentIndex + 1 >= results.length ?
			0 : currentIndex + 1;

		this._state.highlightedResult = this._state.results.get( nextIndex );
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		'findNext': FindNextCommand;
	}
}
