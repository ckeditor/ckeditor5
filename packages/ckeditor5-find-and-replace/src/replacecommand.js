/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/replacecommand
*/

import { Command } from 'ckeditor5/src/core';

/**
 * The replace command. It is used by the {@link module:find-and-replace/findandreplace~FindAndReplace find and replace feature}.
 *
 * @extends module:core/command~Command
 */
export default class ReplaceCommand extends Command {
	/**
	 * Creates a new `ReplaceCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor, state ) {
		super( editor );

		// The replace command is always enabled.
		this.isEnabled = true;

		/**
		 * The find and replace state object used for command operations.
		 *
		 * @private
		 * @member {module:find-and-replace/findandreplaceediting~FindAndReplaceState} #_state
		 */
		this._state = state;
	}

	/**
	 * Replace a given find result by a string or a callback.
	 *
	 * @param {String} replacementText
	 * @param {Object} result A single result from the find command.
	 */
	execute( replacementText, result ) {
		const { model } = this.editor;

		model.change( writer => {
			const range = result.marker.getRange();

			let textAttributes = {};

			for ( const item of range.getItems() ) {
				if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
					textAttributes = item.getAttributes();
					break;
				}
			}

			model.insertContent( writer.createText( replacementText, textAttributes ), range );

			if ( this._state.results.has( result ) ) {
				this._state.results.remove( result );
			}
		} );
	}
}
