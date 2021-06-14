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
 * Replace all command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class ReplaceAllCommand extends ReplaceCommand {
	/**
	 * Creates a new `ReplaceAllCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor );

		// Replace command is always enabled.
		this.isEnabled = true;
	}

	/**
	 * Replaces all find results by a string or a callback.
	 *
	 * @param {String} newText
	 * @param {Collection} activeResults
	 */
	execute( newText, activeResults ) {
		const { editor } = this;
		const { model } = editor;
		const range = model.createRangeIn( model.document.getRoot() );

		const results = activeResults instanceof Collection ?
			activeResults : updateFindResultFromRange( range, model, findByTextCallback( activeResults ) );

		if ( results.length ) {
			this.editor.model.change( () => {
				[ ...results ].forEach( searchResult => {
					// Just reuse logic from replace command to replace a single match.
					super.execute( newText, searchResult );
				} );
			} );
		}
	}
}
