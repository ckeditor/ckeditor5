/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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
	 * Creates a new `FontSizeCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		super( editor, 'fontSize' );
	}
}
