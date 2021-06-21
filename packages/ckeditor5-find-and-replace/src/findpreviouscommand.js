/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findpreviouscommand
*/

import { Command } from 'ckeditor5/src/core';

/**
 * Find next command. Moves the highlight to the next search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class FindPreviousCommand extends Command {
	/**
	 * Creates a new `FindPreviousCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor, state ) {
		super( editor );

		// The command is always enabled.
		this.isEnabled = true;

		this.state = state;
	}

	execute() {
		const results = this.state.results;
		const currentIndex = results.getIndex( this.state.highlightedResult );
		const previousIndex = currentIndex - 1 < 0 ?
			this.state.results.length - 1 : currentIndex - 1;

		this.state.highlightedResult = this.state.results.get( previousIndex );
	}
}
