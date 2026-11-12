/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/replacecommand
*/

import type { Model, ModelRange } from '@ckeditor/ckeditor5-engine';
import type { Collection, CollectionChangeEvent, GetCallback } from '@ckeditor/ckeditor5-utils';
import type { FindResultType } from './findandreplace.js';
import { sortSearchResultsByMarkerPositions } from './findandreplacestate.js';
import { FindReplaceCommandBase } from './replacecommandbase.js';

/**
 * The replace command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export class ReplaceCommand extends FindReplaceCommandBase {
	/**
	 * Replace a given find result by a string or a callback.
	 *
	 * @param result A single result from the find command.
	 *
	 * @fires execute
	 */
	public override execute( replacementText: string, result: FindResultType ): void {
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

		const discardNewSearchResults = watchNewSearchResults( this.editor.model, this._state.results );

		this._replace( replacementText, result );
		discardNewSearchResults();

		// Let's revert the highlight offset to the previous value.
		if ( this._state!.results.length ) {
			// Highlight offset operates on sorted array, so we need to sort the results first.
			// It's not guaranteed that items in state results are sorted, usually they are, but it's not guaranteed when
			// the result is removed from the paragraph with other highlighted results.
			const sortedResults = sortSearchResultsByMarkerPositions( this.editor.model, [ ...this._state!.results ] );

			// Just make sure that we don't overflow the results array, so use modulo.
			this._state!.highlightedResult = sortedResults[ oldHighlightOffset % sortedResults.length ];
		}

		// Discarding the results doesn't refresh the offset if the highlighted result stays the same.
		this._state.refreshHighlightOffset( this.editor.model );
	}
}

/**
 * Replacing must never add search results. However, the search re-run after the replacement removes the results
 * from the changed content and finds them again as new objects, together with new matches inside the inserted text
 * (e.g. "Hello" -> "HelloHello").
 *
 * Starts watching the changes of the results. The returned callback stops watching and removes the results added
 * in the meantime, except for those that took the place of a removed result (i.e. have the same range).
 */
function watchNewSearchResults( model: Model, results: Collection<FindResultType> ): () => void {
	const removedRanges: Array<ModelRange> = [];
	const addedResults: Array<FindResultType> = [];

	// Use the high priority to read the ranges of the removed results before the state removes their markers.
	const onChange: GetCallback<CollectionChangeEvent<FindResultType>> = ( evt, { added, removed } ) => {
		addedResults.push( ...added );

		for ( const removedResult of removed ) {
			// The marker might have already been removed from the model (e.g. when the state is cleared).
			if ( model.markers.has( removedResult.marker!.name ) ) {
				removedRanges.push( removedResult.marker!.getRange() );
			}
		}
	};

	results.on( 'change', onChange, { priority: 'high' } );

	return () => {
		results.off( 'change', onChange );

		for ( const addedResult of addedResults ) {
			// The result might have already been removed in the meantime (e.g. when the state is cleared).
			if ( !results.has( addedResult ) ) {
				continue;
			}

			if ( !removedRanges.some( range => range.isEqual( addedResult.marker!.getRange() ) ) ) {
				results.remove( addedResult );
			}
		}
	};
}
