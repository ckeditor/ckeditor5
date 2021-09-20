/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/replaceallcommand
 */

import { updateFindResultFromRange, findByTextCallback } from './utils';
import { Collection } from 'ckeditor5/src/utils';
import ReplaceCommand from './replacecommand';

/**
 * The replace all command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:find-and-replace/replacecommand~ReplaceCommand
 */
export default class ReplaceAllCommand extends ReplaceCommand {
	/**
	 * Replaces all the occurrences of `textToReplace` with a given `newText` string.
	 *
	 * ```js
	 *	replaceAllCommand.execute( 'replaceAll', 'new text replacement', 'text to replace' );
	 * ```
	 *
	 * Alternatively you can call it from editor instance:
	 *
	 * ```js
	 *	editor.execute( 'replaceAll', 'new text', 'old text' );
	 * ```
	 *
	 * @param {String} newText Text that will be inserted to the editor for each match.
	 * @param {String|module:utils/collection~Collection} textToReplace Text to be replaced or a collection of matches
	 * as returned by the find command.
	 *
	 * @fires module:core/command~Command#event:execute
	 */
	execute( newText, textToReplace ) {
		const { editor } = this;
		const { model } = editor;

		const results = textToReplace instanceof Collection ?
			textToReplace : model.document.getRootNames()
				.reduce( ( ( currentResults, rootName ) => updateFindResultFromRange(
					model.createRangeIn( model.document.getRoot( rootName ) ),
					model,
					findByTextCallback( textToReplace, this._state ),
					currentResults
				) ), null );

		if ( results.length ) {
			model.change( () => {
				[ ...results ].forEach( searchResult => {
					// Just reuse logic from the replace command to replace a single match.
					super.execute( newText, searchResult );
				} );
			} );
		}
	}
}
