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
 * to apply the font size.
 *
 *		editor.execute( 'fontSize', { value: 'small' } );
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class FontSizeCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, 'fontSize' );
	}
}
