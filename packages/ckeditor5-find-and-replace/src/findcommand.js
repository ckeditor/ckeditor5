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
 * Find command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class FindCommand extends Command {
	/**
	 * Creates a new `FindCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor );

		// Find command is always enabled.
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @param {Function|String} callbackOrText
	 * @fires execute
	 */
	execute( callbackOrText ) {
		const { editor } = this;
		const { model } = editor;

		let findCallback;

		// Allow to execute `find()` on a plugin with a keyword only.
		if ( typeof callbackOrText === 'string' ) {
			findCallback = findByTextCallback( callbackOrText );
		} else {
			findCallback = callbackOrText;
		}

		// Initial search is done on all nodes inside content.
		const range = model.createRangeIn( model.document.getRoot() );

		// @todo: fix me
		// this.listenTo( model.document, 'change:data', () => onDocumentChange( results, model, findCallback ) );

		return {
			results: updateFindResultFromRange( range, model, findCallback ),
			findCallback
		};
	}
}
