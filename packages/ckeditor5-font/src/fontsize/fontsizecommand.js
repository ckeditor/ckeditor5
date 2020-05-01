/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize/fontsizecommand
 */

import FontCommand from '../fontcommand';
import { FONT_SIZE } from '../utils';

/**
 * The font size command. It is used by {@link module:font/fontsize/fontsizeediting~FontSizeEditing}
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
		super( editor, FONT_SIZE );
	}
}
