/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/replacecommand
*/

import type { ResultType } from './findandreplace.js';
import { sortSearchResultsByMarkerPositions } from './findandreplacestate.js';
import { ReplaceCommandBase } from './replacecommandbase.js';

/**
 * The replace command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export default class ReplaceCommand extends ReplaceCommandBase {
	/**
	 * Replace a given find result by a string or a callback.
	 *
	 * @param result A single result from the find command.
	 *
	 * @fires execute
	 */
	public override execute( replacementText: string, result: ResultType ): void {
		// We save highlight offset here, as the information about the highlighted result will be lost after the changes.
		//
		// It happens because result list is partially regenerated if the result is removed from the paragraph.
		// Partially means that all sibling result items that are placed in the same paragraph are removed and added again,
		// which causes the highlighted result to be malformed (usually it's set to first but it's not guaranteed).
		//
		// While this saving can be done in editing state, it's better to keep it here, as it's a part of the command logic
		// and might be super tricky to implement in multi-root documents.
		//
		// Keep in mind that the highlighted offset is indexed from 1, as it's displayed to the user. It's why we subtract 1 here.
		//
		// More info: https://github.com/ckeditor/ckeditor5/issues/16648
		const oldHighlightOffset = Math.max( this._state!.highlightedOffset - 1, 0 );

		this._replace( replacementText, result );

		// Let's revert the highlight offset to the previous value.
		if ( this._state!.results.length ) {
			// Highlight offset operates on sorted array, so we need to sort the results first.
			// It's not guaranteed that items in state results are sorted, usually they are, but it's not guaranteed when
			// the result is removed from the paragraph with other highlighted results.
			const sortedResults = sortSearchResultsByMarkerPositions( this.editor.model, [ ...this._state!.results ] );

			// Just make sure that we don't overflow the results array, so use modulo.
			this._state!.highlightedResult = sortedResults[ oldHighlightOffset % sortedResults.length ];
		}
	}
}
