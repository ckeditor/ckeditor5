/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findcommand
*/

import { Command } from 'ckeditor5/src/core';
import { updateFindResultFromRange, findByTextCallback } from './utils';

/**
 * The find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class FindCommand extends Command {
	/**
	 * Creates a new `FindCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor on which this command will be used.
	 */
	constructor( editor, state ) {
		super( editor );

		// The find command is always enabled.
		this.isEnabled = true;

		this.state = state;

		// Do not block the command if the editor goes into the read-only mode as it does not impact the data. See #9975.
		this.listenTo( editor, 'change:isReadOnly', ( evt, name, value ) => {
			if ( value ) {
				this.clearForceDisabled( 'readOnlyMode' );
			}
		} );
	}

	/**
	 * Executes the command.
	 *
	 * @param {Function|String} callbackOrText
	 * @param {Object} [options]
	 * @param {Boolean} [options.matchCase=false] If set to `true`, the letter case will be ignored.
	 * @param {Boolean} [options.wholeWords=false] If set to `true`, only whole words that match `callbackOrText` will be matched.
	 * @fires execute
	 */
	execute( callbackOrText, { matchCase, wholeWords } = {} ) {
		const { editor } = this;
		const { model } = editor;

		let findCallback;

		// Allow to execute `find()` on a plugin with a keyword only.
		if ( typeof callbackOrText === 'string' ) {
			findCallback = findByTextCallback( callbackOrText, { matchCase, wholeWords } );

			this.state.searchText = callbackOrText;
		} else {
			// @todo: disable callback version
			findCallback = callbackOrText;
		}

		// Initial search is done on all nodes inside the content.
		const range = model.createRangeIn( model.document.getRoot() );

		// @todo: fix me
		// this.listenTo( model.document, 'change:data', () => onDocumentChange( results, model, findCallback ) );

		const ret = {
			results: updateFindResultFromRange( range, model, findCallback ),
			findCallback
		};

		this.state.clear( model );
		this.state.results.addMany( Array.from( ret.results ) );
		this.state.highlightedResult = ret.results.get( 0 );

		if ( typeof callbackOrText === 'string' ) {
			// @todo: eliminate this code repetition. Done to fix unit tests.
			this.state.searchText = callbackOrText;
		}

		this.state.matchCase = !!matchCase;
		this.state.matchWholeWords = !!wholeWords;

		return ret;
	}
}
