/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilycommand
 */

import FontCommand from '../fontcommand';

/**
 * The font family command. It is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply font family.
 *
 *		editor.execute( 'fontFamily', { value: 'Arial' } );
 *
 * @extends module:core/command~Command
 */
export default class FontFamilyCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, 'fontFamily' );
	}
}
