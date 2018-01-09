/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/fontsizecommand
 */

import FontCommand from '../fontcommand';

/**
 * The font size command. It is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing}
 * to apply font size.
 *
 * @extends module:core/command~Command
 */
export default class FontSizeCommand extends FontCommand {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 */
	constructor( editor ) {
		super( editor, 'fontSize' );
	}
}
