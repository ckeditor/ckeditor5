/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findpreviouscommand
*/

import FindNextCommand from './findnextcommand';

/**
 * The find previous command. Moves the highlight to the previous search result.
 *
 * It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:find-and-replace/findnextcommand~FindNextCommand
 */
export default class FindPreviousCommand extends FindNextCommand {
	/**
	 * @inheritDoc
	 */
	execute() {
		const results = this._state.results;
		const currentIndex = results.getIndex( this._state.highlightedResult );
		const previousIndex = currentIndex - 1 < 0 ?
			this._state.results.length - 1 : currentIndex - 1;

		this._state.highlightedResult = this._state.results.get( previousIndex );
	}
}
