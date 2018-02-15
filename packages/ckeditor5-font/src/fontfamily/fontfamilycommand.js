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
 * to apply the font family.
 *
 *		editor.execute( 'fontFamily', { value: 'Arial' } );
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class FontFamilyCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, 'fontFamily' );
	}
}
