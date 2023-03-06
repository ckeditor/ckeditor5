/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findcommand
*/

import type { Item } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import type { Collection } from 'ckeditor5/src/utils';

import type FindAndReplaceState from './findandreplacestate';
import type { ResultType } from './findandreplace';
import type FindAndReplaceUtils from './findandreplaceutils';

/**
 * The find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 */
export default class FindCommand extends Command {
	/**
	 * The find and replace state object used for command operations.
	 */
	private _state: FindAndReplaceState;

	/**
	 * Creates a new `FindCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param state An object to hold plugin state.
	 */
	constructor( editor: Editor, state: FindAndReplaceState ) {
		super( editor );

		// The find command is always enabled.
		this.isEnabled = true;

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this._state = state;
	}

	/**
	 * Executes the command.
	 *
	 * @param callbackOrText
	 * @param options Options object.
	 * @param options.matchCase If set to `true`, the letter case will be matched.
	 * @param options.wholeWords If set to `true`, only whole words that match `callbackOrText` will be matched.
	 *
	 * @fires execute
	 */
	public override execute(
		callbackOrText: string | ( ( { item, text }: { item: Item; text: string } ) => Array<ResultType> ),
		{ matchCase, wholeWords }: { matchCase?: boolean; wholeWords?: boolean } = {}
	): { results: Collection<ResultType>; findCallback: ( ( { item, text }: { item: Item; text: string } ) => Array<ResultType> ) } {
		const { editor } = this;
		const { model } = editor;
		const findAndReplaceUtils: FindAndReplaceUtils = editor.plugins.get( 'FindAndReplaceUtils' );

		let findCallback: ( ( { item, text }: { item: Item; text: string } ) => Array<ResultType> ) | undefined;

		// Allow to execute `find()` on a plugin with a keyword only.
		if ( typeof callbackOrText === 'string' ) {
			findCallback = findAndReplaceUtils.findByTextCallback( callbackOrText, { matchCase, wholeWords } );

			this._state.searchText = callbackOrText;
		} else {
			findCallback = callbackOrText;
		}

		// Initial search is done on all nodes in all roots inside the content.
		const results = model.document.getRootNames()
			.reduce( ( ( currentResults: Collection<ResultType> | null, rootName ) => findAndReplaceUtils.updateFindResultFromRange(
				model.createRangeIn( model.document.getRoot( rootName )! ),
				model,
				findCallback!,
				currentResults
			) ), null )!;

		this._state.clear( model );
		this._state.results.addMany( results );
		this._state.highlightedResult = results.get( 0 );

		if ( typeof callbackOrText === 'string' ) {
			this._state.searchText = callbackOrText;
		}

		this._state.matchCase = !!matchCase;
		this._state.matchWholeWords = !!wholeWords;

		return {
			results,
			findCallback
		};
	}
}
