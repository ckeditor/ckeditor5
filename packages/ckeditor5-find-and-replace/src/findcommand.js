/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/findcommand
*/

import { Command } from 'ckeditor5/src/core';

/**
 * Find command. It is used by the {@link module:findandreplace/findandreplace~FindAndReplace link feature}.
 *
 * @extends module:core/command~Command
 */
export default class FindCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		// this.isEnabled = true;
	}

	/**
	 * Executes the command.
	*
	* @fires execute
	*/
	execute() {
	}
}
