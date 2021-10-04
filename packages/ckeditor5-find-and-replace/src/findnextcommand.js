/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findnextcommand
*/

import { Command } from 'ckeditor5/src/core';

/**
 * The find next command. Moves the highlight to the next search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class FindNextCommand extends Command {
	/**
	 * Creates a new `FindNextCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 * @param {module:find-and-replace/findandreplacestate~FindAndReplaceState} state An object to hold plugin state.
	 */
	constructor( editor, state ) {
		super( editor );

		/**
		 * The find and replace state object used for command operations.
		 *
		 * @protected
		 * @member {module:find-and-replace/findandreplacestate~FindAndReplaceState} #_state
		 */
		this._state = state;

		this.isEnabled = false;

		this.listenTo( this._state.results, 'change', () => {
			this.isEnabled = this._state.results.length > 1;
		} );

		// Do not block the command if the editor goes into the read-only mode as it does not impact the data. See #9975.
		this.listenTo( editor, 'change:isReadOnly', () => {
			this.clearForceDisabled( 'readOnlyMode' );
		} );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._state.results.length > 1;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const results = this._state.results;
		const currentIndex = results.getIndex( this._state.highlightedResult );
		const nextIndex = currentIndex + 1 >= results.length ?
			0 : currentIndex + 1;

		this._state.highlightedResult = this._state.results.get( nextIndex );
	}
}
