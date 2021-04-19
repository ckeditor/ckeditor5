/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily/fontfamilycommand
 */

import FontCommand from '../fontcommand';
import { FONT_FAMILY } from '../utils';

/**
 * The font family command. It is used by {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
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
		super( editor, FONT_FAMILY );
	}
}
