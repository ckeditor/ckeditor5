/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamilycommand
 */

import FontCommand from '../fontcommand';

/**
 * The font family command. It is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply font family.
 *
 * @extends module:core/command~Command
 */
export default class FontFamilyCommand extends FontCommand {
	/**
	 * TODO: docs me
	 * @param editor
	 */
	constructor( editor ) {
		super( editor, 'fontFamily' );
	}
}
