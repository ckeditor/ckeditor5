/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorcommand
 */

import FontCommand from '../fontcommand';
import { FONT_BACKGROUND_COLOR } from '../utils';

/**
 * The font background color command. It is used by
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing}
 * to apply the font background color.
 *
 *		editor.execute( 'fontBackgroundColor', { value: 'rgb(250, 20, 20)' } );
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class FontBackgroundColorCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, FONT_BACKGROUND_COLOR );
	}
}
