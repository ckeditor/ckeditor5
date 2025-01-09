/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/replaceallcommand
 */

import { Collection } from 'ckeditor5/src/utils.js';
import type { ResultType } from './findandreplace.js';
import type FindAndReplaceUtils from './findandreplaceutils.js';
import { ReplaceCommandBase } from './replacecommandbase.js';

/**
 * The replace all command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export default class ReplaceAllCommand extends ReplaceCommandBase {
	/**
	 * Replaces all the occurrences of `textToReplace` with a given `newText` string.
	 *
	 * ```ts
	 *	replaceAllCommand.execute( 'replaceAll', 'new text replacement', 'text to replace' );
	 * ```
	 *
	 * Alternatively you can call it from editor instance:
	 *
	 * ```ts
	 *	editor.execute( 'replaceAll', 'new text', 'old text' );
	 * ```
	 *
	 * @param newText Text that will be inserted to the editor for each match.
	 * @param textToReplace Text to be replaced or a collection of matches
	 * as returned by the find command.
	 *
	 * @fires module:core/command~Command#event:execute
	 */
	public override execute( newText: string, textToReplace: string | Collection<ResultType> ): void {
		const { editor } = this;
		const { model } = editor;
		const findAndReplaceUtils: FindAndReplaceUtils = editor.plugins.get( 'FindAndReplaceUtils' );

		const results = textToReplace instanceof Collection ?
			textToReplace : model.document.getRootNames()
				.reduce( ( ( currentResults: Collection<ResultType> | null, rootName ) => findAndReplaceUtils.updateFindResultFromRange(
					model.createRangeIn( model.document.getRoot( rootName )! ),
					model,
					findAndReplaceUtils.findByTextCallback( textToReplace, this._state ),
					currentResults
				) ), null as Collection<ResultType> | null )!;

		if ( results.length ) {
			// Wrapped in single change will batch it into one transaction.
			model.change( () => {
				[ ...results ].forEach( searchResult => {
					// Just reuse logic from the replace command to replace a single match.
					this._replace( newText, searchResult );
				} );
			} );
		}
	}
}
