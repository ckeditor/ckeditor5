/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/replacecommand
*/

import { Command } from 'ckeditor5/src/core';

/**
 * Replace command. It is used by the {@link module:findandreplace/findandreplace~FindAndReplace link feature}.
 *
 * @extends module:core/command~Command
 */
export default class ReplaceCommand extends Command {
	/**
	 * Creates a new `ReplaceCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor );

		// Replace command is always enabled.
		this.isEnabled = true;
	}

	/**
	 * Replace given find result by a string or a callback.
	 *
	 * @param {Object} result A single result from the find command.
	 * @param {String} replacementText
	 */
	execute( { marker }, replacementText ) {
		const { model } = this.editor;

		model.change( writer => {
			const range = marker.getRange();

			// model.insertContent( getDefaultCallback( replacementText ), range );
			// model.insertContent( writer => {
			// 	return writer.createText( replacementText );
			// }, range );

			model.insertContent( writer.createText( replacementText ), range );
		} );

		// function getDefaultCallback( textOrCallback ) {
		// 	return writer => {
		// 		return writer.createText( textOrCallback );
		// 	};
		// }
	}
}
